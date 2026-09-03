import api, { withRetry, unwrap, unwrapPaginated } from './client';
import type { Booking, BookingFilters, BookingInsert, PaginatedResponse } from './types';

export class BookingService {
  static async listForUser(_userId: string, filters: BookingFilters = {}): Promise<{ data: Booking[]; count: number }> {
    const { data } = await withRetry(() =>
      api.get<PaginatedResponse<Booking>>('/bookings', { params: filters })
    );
    return unwrapPaginated({ data });
  }

  static async listAll(filters: BookingFilters = {}): Promise<{ data: Booking[]; count: number }> {
    const { data } = await withRetry(() =>
      api.get<PaginatedResponse<Booking>>('/admin/bookings', { params: filters })
    );
    return unwrapPaginated({ data });
  }

  static async listForOwner(filters: BookingFilters = {}): Promise<{ data: Booking[]; count: number }> {
    const { data } = await withRetry(() =>
      api.get<PaginatedResponse<Booking>>('/owner/bookings', { params: filters })
    );
    return unwrapPaginated({ data });
  }

  static async ownerApprove(id: string): Promise<void> {
    await api.post(`/owner/bookings/${id}/approve`);
  }

  static async ownerReject(id: string, reason: string): Promise<void> {
    await api.post(`/owner/bookings/${id}/reject`, { reason });
  }

  static async ownerStartTrip(id: string): Promise<void> {
    await api.post(`/owner/bookings/${id}/start-trip`);
  }

  static async ownerCompleteTrip(id: string): Promise<void> {
    await api.post(`/owner/bookings/${id}/complete-trip`);
  }

  static async getById(id: string): Promise<Booking | null> {
    try {
      const { data } = await api.get<{ data: Booking } | Booking>(`/bookings/${id}`);
      return unwrap<Booking>({ data });
    } catch {
      return null;
    }
  }

  static async create(payload: Partial<BookingInsert>): Promise<Booking> {
    const { data } = await api.post<{ data: Booking } | Booking>('/bookings', payload);
    return unwrap<Booking>({ data });
  }

  static async updateStatus(id: string, status: string, extra: Record<string, unknown> = {}): Promise<void> {
    await api.patch(`/bookings/${id}/status`, { status, ...extra });
  }

  static async approve(id: string): Promise<void> {
    await api.post(`/admin/bookings/${id}/approve`);
  }

  static async reject(id: string, reason: string): Promise<void> {
    await api.post(`/admin/bookings/${id}/reject`, { reason });
  }

  static async cancel(id: string): Promise<void> {
    await api.put(`/bookings/${id}/cancel`);
  }

  static async assignDriver(id: string, driverProfileId: string): Promise<void> {
    await api.post(`/admin/bookings/${id}/assign-driver`, { driver_profile_id: driverProfileId });
  }

  static async startTrip(id: string): Promise<void> {
    await api.post(`/admin/bookings/${id}/start-trip`);
  }

  static async completeTrip(id: string): Promise<void> {
    await api.post(`/admin/bookings/${id}/complete-trip`);
  }

  static async getStatusCounts(): Promise<Record<string, number>> {
    try {
      const { data } = await api.get<{ data: Record<string, number> } | Record<string, number>>('/admin/bookings/status-counts');
      const body = data as { data?: Record<string, number> } & Record<string, unknown>;
      return (body.data as Record<string, number>) ?? (body as Record<string, number>);
    } catch {
      return {};
    }
  }
}

export default BookingService;
