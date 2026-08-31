import api, { withRetry, unwrap, unwrapPaginated, multipartConfig } from './client';
import type { Vehicle, VehicleFilters, VehicleInsert, PaginatedResponse } from './types';

export class VehicleService {
  static async list(filters: VehicleFilters = {}): Promise<{ data: Vehicle[]; count: number }> {
    const { data } = await withRetry(() =>
      api.get<PaginatedResponse<Vehicle>>('/vehicles', { params: filters })
    );
    return unwrapPaginated({ data });
  }

  static async getById(id: string): Promise<Vehicle | null> {
    try {
      const { data } = await api.get<{ data: Vehicle } | Vehicle>(`/vehicles/${id}`);
      return unwrap<Vehicle>({ data });
    } catch {
      return null;
    }
  }

  static async create(payload: VehicleInsert): Promise<Vehicle> {
    const { data } = await api.post<{ data: Vehicle } | Vehicle>('/vehicles', payload);
    return unwrap<Vehicle>({ data });
  }

  static async update(id: string, payload: Partial<Vehicle>): Promise<Vehicle> {
    const { data } = await api.put<{ data: Vehicle } | Vehicle>(`/vehicles/${id}`, payload);
    return unwrap<Vehicle>({ data });
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  }

  static async uploadPhotos(id: string, photos: FormData): Promise<Vehicle> {
    const { data } = await api.post<{ data: Vehicle } | Vehicle>(`/vehicles/${id}/photos`, photos, multipartConfig());
    return unwrap<Vehicle>({ data });
  }

  static async uploadDocuments(id: string, documents: FormData): Promise<Vehicle> {
    const { data } = await api.post<{ data: Vehicle } | Vehicle>(`/vehicles/${id}/documents`, documents, multipartConfig());
    return unwrap<Vehicle>({ data });
  }

  static async approve(id: string): Promise<void> {
    await api.post(`/admin/vehicles/${id}/approve`);
  }

  static async reject(id: string, reason: string): Promise<void> {
    await api.post(`/admin/vehicles/${id}/reject`, { reason });
  }

  static async getPendingCount(): Promise<number> {
    try {
      const { data } = await api.get<{ count: number } | { data: { count: number } }>('/admin/vehicles/pending-count');
      const body = data as { count?: number; data?: { count?: number } };
      return body.count ?? body.data?.count ?? 0;
    } catch {
      return 0;
    }
  }
}

export default VehicleService;
