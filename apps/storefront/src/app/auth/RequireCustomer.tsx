import { Navigate, Outlet, useLocation } from 'react-router';
import { useCustomerAuth } from './CustomerAuthContext';

export function RequireCustomer() {
  const { status } = useCustomerAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-muted-foreground">
        Loading your account…
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
