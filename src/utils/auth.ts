// Sanctum-compatible auth token manager. Laravel Sanctum uses personal
// access tokens (opaque strings) — there is no refresh token and no JWT
// payload to decode. We store only the access token and the cached user.
import type { User } from '../types/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export class AuthTokenManager {
  static setAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  static getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  static setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  static clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('isLoggedIn');
  }
}

export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

export const isAdmin = (userRole: string): boolean => {
  return hasRole(userRole, ['admin', 'superadmin']);
};

export const isSuperAdmin = (userRole: string): boolean => {
  return userRole === 'superadmin';
};

export const isDriver = (user: { isDriver?: boolean; role?: string } | null): boolean => {
  return user?.isDriver === true || user?.role === 'driver';
};
