import { Navigate, Outlet } from 'react-router-dom';
import { useRootAuth } from '@/hooks/useRootAuth';

export function RootProtected() {
  const { isReady, isRootAuthenticated } = useRootAuth();

  if (!isReady) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }
  if (!isRootAuthenticated) {
    return <Navigate to="/root/login" replace />;
  }
  return <Outlet />;
}
