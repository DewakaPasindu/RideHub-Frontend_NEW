import api, { withRetry, unwrap, unwrapPaginated, multipartConfig } from './client';
import type { DriverProfile, DriverFilters, DriverInsert, PaginatedResponse } from './types';

export class DriverService {
  static async list(filters: DriverFilters = {}): Promise<{ data: DriverProfile[]; count: number }> {
    const { data } = await withRetry(() =>
      api.get<PaginatedResponse<DriverProfile>>('/drivers', { params: filters })
    );
    return unwrapPaginated({ data });
  }

  static async getById(id: string): Promise<DriverProfile | null> {
    try {
      const { data } = await api.get<{ data: DriverProfile } | DriverProfile>(`/drivers/${id}`);
      return unwrap<DriverProfile>({ data });
    } catch {
      return null;
    }
  }

  static async getByUserId(userId: string): Promise<DriverProfile | null> {
    try {
      const { data } = await api.get<{ data: DriverProfile } | DriverProfile>(`/drivers/by-user/${userId}`);
      return unwrap<DriverProfile>({ data });
    } catch {
      return null;
    }
  }

  static async register(payload: DriverInsert): Promise<DriverProfile> {
    const { data } = await api.post<{ data: DriverProfile } | DriverProfile>('/drivers/register', payload);
    return unwrap<DriverProfile>({ data });
  }

  static async create(payload: DriverInsert): Promise<DriverProfile> {
    const { data } = await api.post<{ data: DriverProfile } | DriverProfile>('/drivers', payload);
    return unwrap<DriverProfile>({ data });
  }

  static async update(id: string, payload: Partial<DriverProfile>): Promise<DriverProfile> {
    const { data } = await api.put<{ data: DriverProfile } | DriverProfile>(`/drivers/${id}`, payload);
    return unwrap<DriverProfile>({ data });
  }

  static async uploadDocuments(id: string, documents: FormData): Promise<DriverProfile> {
    const { data } = await api.post<{ data: DriverProfile } | DriverProfile>(`/drivers/${id}/documents`, documents, multipartConfig());
    return unwrap<DriverProfile>({ data });
  }

  static async approve(id: string): Promise<void> {
    await api.post(`/admin/drivers/${id}/approve`);
  }

  static async reject(id: string, reason: string): Promise<void> {
    await api.post(`/admin/drivers/${id}/reject`, { reason });
  }

  static async suspend(id: string, reason: string): Promise<void> {
    await api.post(`/admin/drivers/${id}/suspend`, { reason });
  }

  static async getPendingCount(): Promise<number> {
    try {
      const { data } = await api.get<{ count: number } | { data: { count: number } }>('/admin/drivers/pending-count');
      const body = data as { count?: number; data?: { count?: number } };
      return body.count ?? body.data?.count ?? 0;
    } catch {
      return 0;
    }
  }
}

export default DriverService;
