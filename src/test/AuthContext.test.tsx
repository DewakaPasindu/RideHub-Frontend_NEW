import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the Laravel Sanctum auth service
vi.mock('../services/api/auth.service', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    adminLogin: vi.fn(),
  },
}));

// Mock the token store so login persists into localStorage
vi.mock('../services/api/client', () => ({
  tokenStore: {
    get: () => localStorage.getItem('access_token'),
    set: (t: string) => localStorage.setItem('access_token', t),
    clear: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    },
  },
  userStore: {
    get: () => localStorage.getItem('user'),
    set: (u: unknown) => localStorage.setItem('user', JSON.stringify(u)),
    clear: () => localStorage.removeItem('user'),
  },
}));

// Test component that uses auth context
const TestComponent = () => {
  const { user, isLoggedIn, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="login-status">{isLoggedIn ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="user-name">{user?.name || 'no-user'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuth = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with logged out state', () => {
    renderWithAuth(<TestComponent />);

    expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out');
    expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
  });

  it('should handle successful login', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      role: 'user',
      is_driver: false,
    };

    const { AuthService } = await import('../services/api/auth.service');
    vi.mocked(AuthService.login).mockResolvedValue({
      token: 'mock-access-token',
      user: mockUser as never,
    });

    renderWithAuth(<TestComponent />);

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('logged-in');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
  });

  it('should handle logout', async () => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      })
    );
    localStorage.setItem('access_token', 'mock-token');

    renderWithAuth(<TestComponent />);

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(screen.getByTestId('login-status')).toHaveTextContent('logged-out');
      expect(screen.getByTestId('user-name')).toHaveTextContent('no-user');
    });
  });

  it('should handle admin login redirection', async () => {
    const mockAdmin = {
      id: '1',
      email: 'admin@ridehub.com',
      first_name: 'Admin',
      last_name: 'User',
      role: 'superadmin',
      is_driver: false,
    };

    const { AuthService } = await import('../services/api/auth.service');
    vi.mocked(AuthService.login).mockResolvedValue({
      token: 'mock-admin-token',
      user: mockAdmin as never,
    });

    renderWithAuth(<TestComponent />);

    const { login } = useAuth();
    await login({ email: 'admin@ridehub.com', password: 'password' });

    expect(AuthService.login).toHaveBeenCalledWith({
      email: 'admin@ridehub.com',
      password: 'password',
    });
  });
});
