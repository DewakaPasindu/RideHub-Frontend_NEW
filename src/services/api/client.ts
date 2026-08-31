import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, ValidationErrorResponse } from './types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export const userStore = {
  get: (): unknown | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  set: (user: unknown) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () => localStorage.removeItem(USER_KEY),
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  timeout: 20000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export interface NormalizedApiError {
  status: number;
  message: string;
  errors: Record<string, string[]>;
  raw: AxiosError;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ValidationErrorResponse | ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;

    if (status === 401) {
      tokenStore.clear();
      userStore.clear();
      window.dispatchEvent(new Event('auth:logout'));
    }

    const payload = error.response?.data;
    const message =
      (payload && typeof payload === 'object' && 'message' in payload && payload.message) ||
      error.message ||
      'An unexpected error occurred';

    const errors =
      (payload && typeof payload === 'object' && 'errors' in payload && payload.errors) ||
      {};

    const normalized: NormalizedApiError = {
      status,
      message: typeof message === 'string' ? message : 'Request failed',
      errors: errors as Record<string, string[]>,
      raw: error,
    };

    return Promise.reject(normalized);
  }
);

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = (err as NormalizedApiError)?.status;
      if (status && status >= 400 && status < 500) throw err;
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

export function unwrap<T>(response: { data: ApiResponse<T> | T }): T {
  const body = response.data as ApiResponse<T> | T;
  if (body && typeof body === 'object' && 'data' in (body as ApiResponse<T>)) {
    return (body as ApiResponse<T>).data;
  }
  return body as T;
}

export function unwrapPaginated<T>(
  response: { data: { data: T[]; meta?: { total: number; current_page: number; last_page: number; per_page: number } } }
): { data: T[]; count: number } {
  const body = response.data;
  return {
    data: body.data ?? [],
    count: body.meta?.total ?? body.data?.length ?? 0,
  };
}

export function multipartConfig(): AxiosRequestConfig {
  return { headers: { 'Content-Type': 'multipart/form-data' } };
}

export default api;
