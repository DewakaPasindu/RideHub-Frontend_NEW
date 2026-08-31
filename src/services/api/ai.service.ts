import api, { unwrap } from './client';
import type { Vehicle, DriverProfile, Coordinates, VehicleRecommendation, DriverMatch, ChatMessage, ChatResponse } from './types';

export interface VehicleRecommendationRequest {
  passenger_count: number;
  budget: number;
  distance_km: number;
  luggage_size: 'light' | 'medium' | 'heavy';
  vehicle_type?: string;
  pickup_location?: Coordinates;
  destination?: Coordinates;
  trip_analysis?: TripAnalysis;
}

export interface DriverMatchRequest {
  pickup_location: Coordinates;
  vehicle_type?: string;
  min_experience?: number;
  passenger_count?: number;
  booking_date?: string;
  distance_km?: number;
}

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

export { TripSearchService } from './TripSearchService';

export class AIService {
  static async getVehicleRecommendations(
    request: VehicleRecommendationRequest,
    vehicles?: Vehicle[]
  ): Promise<VehicleRecommendation[]> {
    try {
      const { data } = await api.post<{ data: VehicleRecommendation[] } | VehicleRecommendation[]>(
        '/ai/vehicle-recommendations',
        request
      );
      const result = unwrap<VehicleRecommendation[]>({ data });
      if (result?.length) return result;
    } catch {
      /* fall through to local scoring */
    }

    if (!vehicles?.length) return [];
    return AIService._scoreVehicles(request, vehicles);
  }

  static async getDriverMatches(
    request: DriverMatchRequest,
    drivers: DriverProfile[]
  ): Promise<DriverMatch[]> {
    try {
      const { data } = await api.post<{ data: DriverMatch[] } | DriverMatch[]>(
        '/ai/driver-matching',
        { ...request, driver_ids: drivers.map((d) => d.id) }
      );
      const result = unwrap<DriverMatch[]>({ data });
      if (result?.length) return result;
    } catch {
      /* fall through to local scoring */
    }

    return AIService._scoreDrivers(request, drivers);
  }

  static async chat(messages: ChatMessage[], userInput: string): Promise<ChatResponse> {
    try {
      const { data } = await api.post<{ data: ChatResponse } | ChatResponse>('/ai/chat', {
        messages,
        message: userInput,
      });
      return unwrap<ChatResponse>({ data }) ?? { reply: userInput };
    } catch {
      return AIService._localChat(userInput);
    }
  }

  static async reportEmergency(bookingId: string, location: Coordinates, description: string): Promise<void> {
    await api.post('/ai/emergency-alert', { booking_id: bookingId, location, description });
  }

  private static _scoreVehicles(
    req: VehicleRecommendationRequest,
    vehicles: Vehicle[]
  ): VehicleRecommendation[] {
    const analysis: TripAnalysis = req.trip_analysis ?? {
      distance_km: req.distance_km,
      estimated_minutes: 0,
      estimated_hours_label: '',
      passengers: req.passenger_count,
      budget: req.budget,
      luggage_size: req.luggage_size,
      trip_date: '',
      driver_required: false,
      recommended_vehicle_types: [],
      budget_per_km: req.budget / Math.max(req.distance_km, 1),
      feasibility: 'good',
      feasibility_note: '',
    };

    const scored = vehicles
      .map((v) => {
        const { score, confidence, reasons } = TripSearchService.scoreVehicle(
          {
            seat_count: v.seat_count,
            price_per_day: v.price_per_day,
            vehicle_type: v.vehicle_type,
            has_ac: v.has_ac,
            features: v.features,
          },
          {
            passenger_count: req.passenger_count,
            budget: req.budget,
            luggage_size: req.luggage_size,
            trip_date: '',
            driver_required: false,
            pickup: { lat: req.pickup_location?.lat ?? 0, lng: req.pickup_location?.lng ?? 0, address: '' },
            destination: { lat: req.destination?.lat ?? 0, lng: req.destination?.lng ?? 0, address: '' },
          },
          analysis
        );
        return { vehicle: v, score, confidence, reasons, rank: 0 };
      })
      .filter((r) => r.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r, i) => ({ ...r, rank: i + 1 }));

    return scored;
  }

  private static _scoreDrivers(req: DriverMatchRequest, drivers: DriverProfile[]): DriverMatch[] {
    return drivers
      .map((d) => {
        const scored = TripSearchService.scoreDriver(
          {
            experience_years: d.experience_years,
            rating: d.rating,
            availability_status: d.availability_status,
            nearest_town: d.nearest_town,
          },
          req.pickup_location,
          req.distance_km ?? 0
        );
        const estimated_arrival_min = Math.round((scored.distance_km / 30) * 60);
        return {
          driver: d,
          distance_score: scored.distance_score,
          experience_score: scored.experience_score,
          rating_score: scored.rating_score,
          availability_score: scored.availability_score,
          final_score: scored.final_score,
          distance_km: scored.distance_km,
          reason: scored.reason,
          estimated_arrival_min,
        };
      })
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, 6);
  }

  static _localChat(input: string): ChatResponse {
    const lower = input.toLowerCase();
    const trip_info: Record<string, unknown> = {};
    const pMatch = input.match(/\b(\d+)\s*(people|persons?|passengers?|seats?)\b/i);
    if (pMatch) trip_info.passengers = parseInt(pMatch[1]);
    if (lower.includes('van')) trip_info.vehicle_type = 'van';
    else if (lower.includes('suv')) trip_info.vehicle_type = 'suv';
    else if (lower.includes('bus') || lower.includes('minibus')) trip_info.vehicle_type = 'minibus';
    else if (lower.includes('car')) trip_info.vehicle_type = 'car';
    if (lower.includes('tomorrow')) trip_info.date = 'Tomorrow';
    else if (lower.includes('today')) trip_info.date = 'Today';
    else if (lower.includes('weekend')) trip_info.date = 'This weekend';
    const towns = ['Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 'Matara', 'Nuwara Eliya'];
    const found = towns.filter((t) => lower.includes(t.toLowerCase()));
    if (found.length >= 2) {
      trip_info.origin = found[0];
      trip_info.destination = found[1];
    } else if (found.length === 1) {
      trip_info.destination = found[0];
    }
    const parts: string[] = ['I\'ve analyzed your trip request!\n'];
    if (trip_info.passengers) parts.push(`• **${trip_info.passengers} passengers** — looking for suitable vehicles.`);
    if (trip_info.vehicle_type) parts.push(`• **${(trip_info.vehicle_type as string).charAt(0).toUpperCase() + (trip_info.vehicle_type as string).slice(1)}** type preferred.`);
    if (trip_info.date) parts.push(`• **${trip_info.date}** — checking availability.`);
    if (trip_info.destination) parts.push(`• **Destination: ${trip_info.destination}**`);
    if (parts.length === 1) parts.push('Could you share more details? e.g. number of passengers, destination, date, and budget.');
    else parts.push('\n**Use the Trip Planner to get AI-powered recommendations instantly!**');
    return { reply: parts.join('\n'), trip_info };
  }
}

export default AIService;
