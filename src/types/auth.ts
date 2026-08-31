// Auth types aligned with Laravel 12 + Sanctum response envelopes.
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: 'user' | 'driver' | 'admin' | 'superadmin';
  isDriver: boolean;
  profilePhoto?: string;
  mobileNumber?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  role: "customer" | "driver";
  first_name: string;
  last_name: string;
  password_confirmation: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isDriver: boolean;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}
