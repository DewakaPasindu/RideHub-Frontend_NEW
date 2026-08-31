import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requireDriver?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles,
  requireDriver = false,
  requireAdmin = false,
  requireSuperAdmin = false
}: ProtectedRouteProps) {
  const { user, isLoggedIn, hasRole, isAdmin, isSuperAdmin, isDriver } = useAuth();

  // Show loading while checking authentication
  if (isLoggedIn === undefined) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Check specific role requirements
  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (requireDriver && !isDriver()) {
    return <Navigate to="/" replace />;
  }

  // Check general role requirements
  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}