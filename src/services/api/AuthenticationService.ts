// Backward-compatibility shim — delegates to the new Laravel Sanctum auth service.
import { AuthService } from './auth.service';
import type { AuthResponse, User, Availability } from './types';

export type { AuthResponse, User, AuthUser } from './types';
export type AvailabilitySlot = Availability;

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload {
  first_name: string; last_name: string; email: string;
  password: string; password_confirmation: string; is_driver?: boolean; mobile_number?: string;
}

// Re-export the AuthUser type alias used by older consumers
export type AuthUser = User;

export class AuthenticationService {
  static async login(payload: LoginPayload): Promise<AuthResponse> {
    return AuthService.login(payload);
  }

  static async register(payload: RegisterPayload): Promise<AuthResponse> {
    return AuthService.register(payload);
  }

  static async logout(): Promise<void> {
    return AuthService.logout();
  }

  static async me(): Promise<User> {
    return AuthService.me();
  }

  static async forgotPassword(email: string): Promise<void> {
    return AuthService.forgotPassword(email);
  }

  static async resetPassword(payload: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> {
    return AuthService.resetPassword(payload);
  }

  static async adminLogin(payload: { email: string; password: string }): Promise<AuthResponse> {
    return AuthService.adminLogin(payload);
  }

  static async adminRegister(payload: { username: string; email: string; password: string; password_confirmation: string; role: string }): Promise<AuthResponse> {
    return AuthService.adminRegister(payload);
  }

  static async getDriverAvailability(driverId: string, startDate?: string, endDate?: string): Promise<Availability[]> {
    const { AvailabilityService } = await import('./availability.service');
    return AvailabilityService.getDriverAvailability(driverId, startDate, endDate);
  }

  static async setDriverAvailability(driverId: string, dates: string[]): Promise<void> {
    const { AvailabilityService } = await import('./availability.service');
    return AvailabilityService.setDriverAvailability(driverId, dates);
  }

  static async updateProfile(payload: Partial<User> & { mobile_number?: string; address?: string }): Promise<User> {
    return AuthService.updateProfile(payload);
  }
}
