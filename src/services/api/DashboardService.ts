// Backward-compatibility shim — delegates to the new Laravel admin service.
import { AdminService } from './admin.service';
import type { DashboardStats, AdminUser } from './types';

export type { DashboardStats, AdminUser };

export class DashboardService {
  static async getStats(): Promise<DashboardStats> {
    return AdminService.getStats();
  }

  static async listAdmins(): Promise<AdminUser[]> {
    return AdminService.listAdmins();
  }

  static async createAdmin(payload: { username: string; email: string; password: string; password_confirmation: string; role: string }): Promise<AdminUser> {
    return AdminService.createAdmin(payload);
  }

  static async updateAdmin(id: string, payload: Partial<AdminUser>): Promise<AdminUser> {
    return AdminService.updateAdmin(id, payload);
  }

  static async deleteAdmin(id: string): Promise<void> {
    return AdminService.deleteAdmin(id);
  }

  static async listUsers(params?: { search?: string; role?: string; page?: number }): Promise<{ data: unknown[]; count: number }> {
    return AdminService.listUsers(params);
  }
}
