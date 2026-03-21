import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="loading-spinner">Verifying credentials...</div>;
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Force password change guard
  if (user.must_change_password) {
    const isChangePasswordPage = location.pathname === `/${user.role}/change-password`;
    if (!isChangePasswordPage) {
      return <Navigate to={`/${user.role}/change-password`} replace />;
    }
  }

  return <Outlet />;
};
