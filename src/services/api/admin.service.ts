import api, { withRetry, unwrap, unwrapPaginated } from './client';
import type { DashboardStats, AdminUser, PaginatedResponse } from './types';

export interface AdminUserPayload {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

export class AdminService {
  static async getStats(): Promise<DashboardStats> {
    const { data } = await withRetry(() =>
      api.get<{ data: DashboardStats } | DashboardStats>('/admin/dashboard/stats')
    );
    return unwrap<DashboardStats>({ data });
  }

  static async listAdmins(): Promise<AdminUser[]> {
    const { data } = await api.get<{ data: AdminUser[] } | AdminUser[]>('/admin/users');
    return unwrap<AdminUser[]>({ data });
  }

  static async createAdmin(payload: AdminUserPayload): Promise<AdminUser> {
    const { data } = await api.post<{ data: AdminUser } | AdminUser>('/admin/users', payload);
    return unwrap<AdminUser>({ data });
  }

  static async updateAdmin(id: string, payload: Partial<AdminUser>): Promise<AdminUser> {
    const { data } = await api.put<{ data: AdminUser } | AdminUser>(`/admin/users/${id}`, payload);
    return unwrap<AdminUser>({ data });
  }

  static async deleteAdmin(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }

  static async listUsers(params?: { search?: string; role?: string; page?: number }): Promise<{ data: unknown[]; count: number }> {
    const { data } = await api.get<PaginatedResponse<unknown>>('/admin/users', { params });
    return unwrapPaginated({ data });
  }

  static async listVehicles(params?: Record<string, unknown>): Promise<{ data: unknown[]; count: number }> {
    const { data } = await api.get<PaginatedResponse<unknown>>('/admin/vehicles', { params });
    return unwrapPaginated({ data });
  }

  static async listDrivers(params?: Record<string, unknown>): Promise<{ data: unknown[]; count: number }> {
    const { data } = await api.get<PaginatedResponse<unknown>>('/admin/drivers', { params });
    return unwrapPaginated({ data });
  }

  static async listBookings(params?: Record<string, unknown>): Promise<{ data: unknown[]; count: number }> {
    const { data } = await api.get<PaginatedResponse<unknown>>('/admin/bookings', { params });
    return unwrapPaginated({ data });
  }
}

export default AdminService;
