import api, { withRetry, unwrap, unwrapPaginated } from './client';
import type { Review, ReviewStats, PaginatedResponse } from './types';

export class ReviewService {
  static async listForVehicle(vehicleId: string): Promise<Review[]> {
    const { data } = await withRetry(() =>
      api.get<{ data: Review[] } | Review[]>(`/vehicles/${vehicleId}/reviews`)
    );
    return unwrap<Review[]>({ data });
  }

  static async listForDriver(driverProfileId: string): Promise<Review[]> {
    const { data } = await withRetry(() =>
      api.get<{ data: Review[] } | Review[]>(`/drivers/${driverProfileId}/reviews`)
    );
    return unwrap<Review[]>({ data });
  }

  static async listAll(status?: string, page = 1, perPage = 20): Promise<{ data: Review[]; count: number }> {
    const { data } = await api.get<PaginatedResponse<Review>>('/admin/reviews', {
      params: { status, page, per_page: perPage },
    });
    return unwrapPaginated({ data });
  }

  static async create(payload: {
    user_id: string;
    booking_id?: string;
    target_type: 'vehicle' | 'driver';
    vehicle_id?: string;
    driver_profile_id?: string;
    target_name: string;
    rating: number;
    comment?: string;
  }): Promise<Review> {
    const { data } = await api.post<{ data: Review } | Review>('/reviews', payload);
    return unwrap<Review>({ data });
  }

  static async approve(id: string): Promise<void> {
    await api.post(`/admin/reviews/${id}/approve`);
  }

  static async reject(id: string, note: string): Promise<void> {
    await api.post(`/admin/reviews/${id}/reject`, { note });
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/admin/reviews/${id}`);
  }

  static async getStats(targetType: 'vehicle' | 'driver', targetId: string): Promise<ReviewStats> {
    try {
      const endpoint =
        targetType === 'vehicle'
          ? `/vehicles/${targetId}/reviews/stats`
          : `/drivers/${targetId}/reviews/stats`;
      const { data } = await api.get<{ data: ReviewStats } | ReviewStats>(endpoint);
      return unwrap<ReviewStats>({ data });
    } catch {
      return { avg: 0, count: 0, distribution: {} };
    }
  }
}

export default ReviewService;
