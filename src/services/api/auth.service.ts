import api, { tokenStore, userStore, unwrap } from './client';
import type { AuthResponse, User } from './types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role: 'customer' | 'driver';
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminRegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
}

export class AuthService {
  static async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse } | AuthResponse>('/auth/login', payload);
    const result = unwrap<AuthResponse>({ data });
    tokenStore.set(result.token);
    userStore.set(result.user);
    return result;
  }

  static async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse } | AuthResponse>('/auth/register', payload);
    const result = unwrap<AuthResponse>({ data });
    tokenStore.set(result.token);
    userStore.set(result.user);
    return result;
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      tokenStore.clear();
      userStore.clear();
    }
  }

  static async me(): Promise<User> {
    const { data } = await api.get<{ data: User } | User>('/auth/me');
    return unwrap<User>({ data });
  }

  static async updateProfile(payload: Partial<User> & { mobile_number?: string; address?: string }): Promise<User> {
    const { data } = await api.put<{ data: User } | User>('/auth/profile', payload);
    return unwrap<User>({ data });
  }

  static async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  }

  static async resetPassword(payload: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> {
    await api.post('/auth/reset-password', payload);
  }

  static async adminLogin(payload: AdminLoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse } | AuthResponse>('/admin/auth/login', payload);
    const result = unwrap<AuthResponse>({ data });
    tokenStore.set(result.token);
    userStore.set(result.user);
    return result;
  }

  static async adminRegister(payload: AdminRegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<{ data: AuthResponse } | AuthResponse>('/admin/auth/register', payload);
    const result = unwrap<AuthResponse>({ data });
    tokenStore.set(result.token);
    userStore.set(result.user);
    return result;
  }
}

export default AuthService;
