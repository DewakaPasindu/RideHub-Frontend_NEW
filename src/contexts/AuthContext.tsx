import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/api/auth.service';
import { tokenStore, userStore } from '../services/api/client';
import type { User as AuthUser } from '../services/api/types';
import { LoginCredentials, RegisterData } from '../types/auth';
import { logInfo, logError, logUserAction } from '../utils/logger';

interface AuthContextUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'driver' | 'admin' | 'superadmin';
  isDriver: boolean;
}

interface AuthContextType {
  user: AuthContextUser | null;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  hasRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isDriver: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

const toContextUser = (u: AuthUser): AuthContextUser => ({
  id: u.id,
  email: u.email,
  name: `${u.first_name} ${u.last_name}`,
  role: u.role,
  isDriver: u.is_driver,
});

const USER_KEY = 'user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    const token = tokenStore.get();
    if (stored && token) {
      setUser(JSON.parse(stored));
      setIsLoggedIn(true);
    }
    setLoading(false);

    const handleForceLogout = () => doLogout();
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const persistUser = (u: AuthContextUser) => {
    setUser(u);
    setIsLoggedIn(true);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  };

  const doLogout = () => {
    tokenStore.clear();
    userStore.clear();
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem(USER_KEY);
  };

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      logUserAction('User login attempt', { email: credentials.email });
      const response = await AuthService.login(credentials);
      persistUser(toContextUser(response.user));
      logInfo('Login successful', { userId: response.user.id });
      return true;
    } catch (error) {
      logError('Login failed', error as Error, { email: credentials.email });
      doLogout();
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
        logUserAction('User registration attempt', { email: userData.email });

        console.log('Register Payload:', userData);

        await AuthService.register({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: userData.password,
            password_confirmation: userData.password_confirmation,
            role: userData.role,
        });

        logInfo('User registered successfully');

        return true;

    } catch (error) {
        logError('Registration failed', error as Error, { email: userData.email });

        return false;
    }
};

  const logout = () => {
    logUserAction('User logout', { userId: user?.id });
    AuthService.logout().catch(() => {});
    doLogout();
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const me = await AuthService.me();
      persistUser(toContextUser(me));
      return true;
    } catch {
      doLogout();
      return false;
    }
  };

  const hasRole = (roles: string[]) => !!user && roles.includes(user.role);
  const isAdmin = () => !!user && ['admin', 'superadmin'].includes(user.role);
  const isSuperAdmin = () => user?.role === 'superadmin';
  const isDriver = () => !!user && (user.isDriver || user.role === 'driver');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, register, refreshToken, hasRole, isAdmin, isSuperAdmin, isDriver }}>
      {children}
    </AuthContext.Provider>
  );
};
