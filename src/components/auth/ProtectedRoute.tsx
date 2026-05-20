import * as React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

export function RoleRoute({ allow }: { allow: string[] }) {
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  const userRoles = Array.isArray((user as any)?.roles) && (user as any).roles.length > 0
    ? ((user as any).roles as string[])
    : user?.role
      ? [user.role]
      : [];

  const ok = allow.some((r) => userRoles.includes(r));
  if (!ok) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

