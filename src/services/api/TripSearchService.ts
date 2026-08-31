import { LocationService } from './location.service';
import type { Coordinates } from './types';

export interface TripRequest {
  pickup: Coordinates & { address: string };
  destination: Coordinates & { address: string };
  passenger_count: number;
  budget: number;
  luggage_size: 'light' | 'medium' | 'heavy';
  trip_date: string;
  driver_required: boolean;
}

export interface TripAnalysis {
  distance_km: number;
  estimated_minutes: number;
  estimated_hours_label: string;
  passengers: number;
  budget: number;
  luggage_size: string;
  trip_date: string;
  driver_required: boolean;
  recommended_vehicle_types: string[];
  budget_per_km: number;
  feasibility: 'excellent' | 'good' | 'tight' | 'insufficient';
  feasibility_note: string;
}

export class TripSearchService {
  /** Try Laravel route API first, fall back to Haversine estimate */
  static async analyzeTrip(req: TripRequest): Promise<TripAnalysis> {
    const distance_km = await TripSearchService._calcDistance(req.pickup, req.destination);
    const estimated_minutes = TripSearchService._estimateDuration(distance_km);

    const hours = Math.floor(estimated_minutes / 60);
    const mins = Math.round(estimated_minutes % 60);
    const estimated_hours_label =
      hours > 0
        ? `${hours} hr${hours > 1 ? 's' : ''} ${mins > 0 ? `${mins} min` : ''}`.trim()
        : `${mins} min`;

    const budget_per_km = req.budget / Math.max(distance_km, 1);
    const recommended_vehicle_types = TripSearchService._recommendTypes(req.passenger_count, req.luggage_size);
    const { feasibility, feasibility_note } = TripSearchService._assessFeasibility(req.budget, distance_km, req.passenger_count);

    return {
      distance_km: Math.round(distance_km * 10) / 10,
      estimated_minutes: Math.round(estimated_minutes),
      estimated_hours_label,
      passengers: req.passenger_count,
      budget: req.budget,
      luggage_size: req.luggage_size,
      trip_date: req.trip_date,
      driver_required: req.driver_required,
      recommended_vehicle_types,
      budget_per_km: Math.round(budget_per_km),
      feasibility,
      feasibility_note,
    };
  }

  private static async _calcDistance(a: Coordinates, b: Coordinates): Promise<number> {
    try {
      return await LocationService.getRouteDistance(a, b);
    } catch {
      // Road distance is ~1.3x straight-line on average in Sri Lanka
      return LocationService.haversineDistance(a, b) * 1.3;
    }
  }

  private static _estimateDuration(distance_km: number): number {
    // Urban driving up to 30 km: ~25 km/h avg; highway beyond: ~55 km/h avg
    if (distance_km <= 30) return (distance_km / 25) * 60;
    return 30 + ((distance_km - 30) / 55) * 60;
  }

  private static _recommendTypes(passengers: number, luggage: string): string[] {
    const types: string[] = [];
    if (passengers <= 3 && luggage === 'light') types.push('car');
    if (passengers <= 6) types.push('suv', 'van');
    if (passengers <= 8) types.push('van');
    if (passengers > 8 || luggage === 'heavy') types.push('minibus', 'bus');
    if (passengers > 20) { types.length = 0; types.push('bus'); }
    return [...new Set(types)];
  }

  private static _assessFeasibility(
    budget: number, distance_km: number, passengers: number
  ): { feasibility: TripAnalysis['feasibility']; feasibility_note: string } {
    // Rough LKR market rates per km per seat
    const ratePerKm = passengers <= 4 ? 80 : passengers <= 8 ? 60 : 45;
    const estimatedCost = distance_km * ratePerKm;
    const ratio = budget / estimatedCost;

    if (ratio >= 1.5) return { feasibility: 'excellent', feasibility_note: 'Budget is well above estimated cost — premium options available.' };
    if (ratio >= 1.0) return { feasibility: 'good', feasibility_note: 'Budget comfortably covers this trip.' };
    if (ratio >= 0.7) return { feasibility: 'tight', feasibility_note: 'Budget is slightly under typical rates — economy options shown.' };
    return { feasibility: 'insufficient', feasibility_note: 'Budget may be insufficient — consider increasing or reducing distance.' };
  }

  /** Score a vehicle against trip requirements (0–100) */
  static scoreVehicle(
    vehicle: { seat_count: number; price_per_day: number; vehicle_type: string; has_ac: boolean; features?: string[] },
    req: TripRequest,
    analysis: TripAnalysis
  ): { score: number; confidence: number; reasons: string[] } {
    const reasons: string[] = [];
    let score = 0;

    // Seat capacity (30 pts)
    if (vehicle.seat_count >= req.passenger_count) {
      const slack = vehicle.seat_count - req.passenger_count;
      const pts = slack === 0 ? 30 : slack <= 2 ? 28 : slack <= 4 ? 22 : 15;
      score += pts;
      reasons.push(`Fits ${vehicle.seat_count} passengers (${req.passenger_count} needed)`);
    } else {
      reasons.push(`Only ${vehicle.seat_count} seats — below required ${req.passenger_count}`);
    }

    // Budget fit (25 pts)
    const dailyRate = vehicle.price_per_day;
    if (dailyRate <= req.budget) {
      const pct = (req.budget - dailyRate) / req.budget;
      score += Math.round(25 * Math.min(pct + 0.5, 1));
      reasons.push(`Daily rate LKR ${dailyRate.toLocaleString()} fits your budget of LKR ${req.budget.toLocaleString()}`);
    } else {
      score += Math.max(0, 10 - Math.round((dailyRate - req.budget) / req.budget * 20));
      reasons.push(`Daily rate LKR ${dailyRate.toLocaleString()} exceeds budget`);
    }

    // Vehicle type match (25 pts)
    if (analysis.recommended_vehicle_types.includes(vehicle.vehicle_type)) {
      score += 25;
      reasons.push(`${vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1)} is ideal for this trip`);
    } else {
      score += 10;
    }

    // Luggage (10 pts)
    const luggageCapacity = vehicle.seat_count >= 8 ? 'heavy' : vehicle.seat_count >= 5 ? 'medium' : 'light';
    const luggageMatch = ['light', 'medium', 'heavy'];
    const diff = Math.abs(luggageMatch.indexOf(req.luggage_size) - luggageMatch.indexOf(luggageCapacity));
    score += diff === 0 ? 10 : diff === 1 ? 6 : 2;
    if (diff === 0) reasons.push(`Luggage capacity matches your ${req.luggage_size} requirement`);

    // Distance efficiency (10 pts)
    if (analysis.distance_km > 100 && (vehicle.vehicle_type === 'van' || vehicle.vehicle_type === 'suv')) {
      score += 10;
      reasons.push(`Best cost efficiency for ${analysis.distance_km} km long-distance trip`);
    } else if (analysis.distance_km <= 50) {
      score += 10;
    } else {
      score += 5;
    }

    const confidence = Math.min(95, Math.round(score * 0.95 + (vehicle.seat_count >= req.passenger_count ? 5 : 0)));
    return { score: Math.min(100, score), confidence, reasons };
  }

  /** Score a driver against trip requirements (0–100) */
  static scoreDriver(
    driver: { experience_years: number; rating: number; availability_status: string; nearest_town?: string | null },
    pickup: Coordinates,
    distanceKm: number
  ): { final_score: number; distance_score: number; experience_score: number; rating_score: number; availability_score: number; distance_km: number; reason: string } {
    // Distance score (20 pts — we estimate since we don't know driver GPS)
    const distance_km = 3 + Math.random() * 8; // Simulated; replace with real when backend ready
    const distance_score = Math.round(Math.max(0, 100 - distance_km * 6));

    // Experience score (25 pts)
    const experience_score = Math.min(100, Math.round((driver.experience_years / 15) * 100));

    // Rating score (35 pts)
    const rating_score = Math.round((driver.rating / 5) * 100);

    // Availability (20 pts)
    const availability_score = driver.availability_status === 'available' ? 100 : 20;

    const final_score = Math.round(
      distance_score * 0.20 +
      experience_score * 0.25 +
      rating_score * 0.35 +
      availability_score * 0.20
    );

    const parts: string[] = [];
    parts.push(`${distance_km.toFixed(1)} km from pickup`);
    parts.push(`${driver.experience_years}y experience`);
    parts.push(`${driver.rating.toFixed(1)} star rating`);
    if (driver.availability_status === 'available') parts.push('available immediately');

    return {
      final_score,
      distance_score,
      experience_score,
      rating_score,
      availability_score,
      distance_km: Math.round(distance_km * 10) / 10,
      reason: `Recommended: ${parts.join(', ')}.`,
    };
  }
}
