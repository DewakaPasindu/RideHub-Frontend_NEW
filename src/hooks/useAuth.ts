import { useAuth as useAuthContext } from '../contexts/AuthContext';

export const useAuth = useAuthContext;

export const useRequireAuth = (requiredRoles?: string[]) => {
  const { user, isLoggedIn } = useAuthContext();

  if (!isLoggedIn) {
    throw new Error('Authentication required');
  }

  if (requiredRoles && !requiredRoles.includes(user?.role || '')) {
    throw new Error('Insufficient permissions');
  }

  return { user, isLoggedIn };
};

export const useRequireDriver = () => {
  const { user, isLoggedIn, isDriver } = useAuthContext();

  if (!isLoggedIn) {
    throw new Error('Authentication required');
  }

  if (!isDriver()) {
    throw new Error('Driver role required');
  }

  return { user, isLoggedIn };
};

export const useRequireAdmin = () => {
  const { user, isLoggedIn, isAdmin } = useAuthContext();

  if (!isLoggedIn) {
    throw new Error('Authentication required');
  }

  if (!isAdmin()) {
    throw new Error('Admin role required');
  }

  return { user, isLoggedIn };
};

export const useRequireSuperAdmin = () => {
  const { user, isLoggedIn, isSuperAdmin } = useAuthContext();

  if (!isLoggedIn) {
    throw new Error('Authentication required');
  }

  if (!isSuperAdmin()) {
    throw new Error('Super admin role required');
  }

  return { user, isLoggedIn };
};