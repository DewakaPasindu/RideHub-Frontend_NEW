import api, { unwrap } from './client';
import type { Coordinates, LocationSuggestion, ReverseGeocodeResult } from './types';

export class LocationService {
  static getCurrentPosition(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  static watchPosition(
    onUpdate: (coords: Coordinates) => void,
    onError?: (err: GeolocationPositionError) => void
  ): number {
    if (!navigator.geolocation) return -1;
    return navigator.geolocation.watchPosition(
      (pos) => onUpdate({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      onError,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }

  static clearWatch(watchId: number) {
    if (watchId >= 0) navigator.geolocation.clearWatch(watchId);
  }

  static async searchLocations(query: string): Promise<LocationSuggestion[]> {
    try {
      const { data } = await api.get<{ data: LocationSuggestion[] } | LocationSuggestion[]>('/locations/search', {
        params: { q: query },
      });
      return unwrap<LocationSuggestion[]>({ data });
    } catch {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=lk`
      );
      const results = (await res.json()) as Array<{ place_id: string; display_name: string; lat: string; lon: string }>;
      return results.map((r) => ({
        place_id: String(r.place_id),
        display_name: r.display_name,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      }));
    }
  }

  static async reverseGeocode(coords: Coordinates): Promise<string> {
    try {
      const { data } = await api.get<{ data: { address: string } } | { address: string }>('/locations/reverse', {
        params: { lat: coords.lat, lng: coords.lng },
      });
      const body = data as { data?: { address: string }; address?: string };
      return body.data?.address ?? body.address ?? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    } catch {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json`);
      const result = (await res.json()) as { display_name?: string };
      return result.display_name ?? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
    }
  }

  static async getRouteDistance(from: Coordinates, to: Coordinates): Promise<number> {
    try {
      const { data } = await api.get<{ data: { distance_km: number } } | { distance_km: number }>('/routes/distance', {
        params: { from_lat: from.lat, from_lng: from.lng, to_lat: to.lat, to_lng: to.lng },
      });
      const body = data as { data?: { distance_km: number }; distance_km?: number };
      return body.data?.distance_km ?? body.distance_km ?? LocationService.haversineDistance(from, to);
    } catch {
      return LocationService.haversineDistance(from, to) * 1.3;
    }
  }

  static haversineDistance(a: Coordinates, b: Coordinates): number {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const sin2 =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
  }

  static async updateDriverLocation(driverProfileId: string, coords: Coordinates): Promise<void> {
    await api.post(`/drivers/${driverProfileId}/location`, coords);
  }

  static async getDriverLocation(driverProfileId: string): Promise<Coordinates | null> {
    try {
      const { data } = await api.get<{ data: Coordinates } | Coordinates>(`/drivers/${driverProfileId}/location`);
      return unwrap<Coordinates>({ data });
    } catch {
      return null;
    }
  }
}

export type { Coordinates, LocationSuggestion, ReverseGeocodeResult };

export default LocationService;
