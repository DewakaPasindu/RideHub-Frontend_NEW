import api, { withRetry, unwrap } from './client';
import type { Availability } from './types';

export interface AvailabilityFilters {
  driver_id?: string;
  start_date?: string;
  end_date?: string;
}

export class AvailabilityService {
  static async list(filters: AvailabilityFilters = {}): Promise<Availability[]> {
    const { data } = await withRetry(() =>
      api.get<{ data: Availability[] } | Availability[]>('/availability', { params: filters })
    );
    return unwrap<Availability[]>({ data });
  }

  static async getDriverAvailability(driverId: string, startDate?: string, endDate?: string): Promise<Availability[]> {
    const params: Record<string, string> = { driver_id: driverId };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const { data } = await withRetry(() =>
      api.get<{ data: Availability[] } | Availability[]>(`/drivers/${driverId}/availability`, { params })
    );
    return unwrap<Availability[]>({ data });
  }

  static async setDriverAvailability(driverId: string, dates: string[]): Promise<void> {
    await api.post(`/drivers/${driverId}/availability`, { dates });
  }

  static async create(payload: Omit<Availability, 'id' | 'created_at' | 'updated_at'>): Promise<Availability> {
    const { data } = await api.post<{ data: Availability } | Availability>('/availability', payload);
    return unwrap<Availability>({ data });
  }

  static async update(id: string, payload: Partial<Availability>): Promise<Availability> {
    const { data } = await api.put<{ data: Availability } | Availability>(`/availability/${id}`, payload);
    return unwrap<Availability>({ data });
  }

  static async remove(id: string): Promise<void> {
    await api.delete(`/availability/${id}`);
  }
}

export default AvailabilityService;
