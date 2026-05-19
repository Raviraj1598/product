import { Outlet } from 'react-router';
import { StoreProvider } from '@boutique/shared';

/** Loads catalog sync only after the user passes {@link RequireAuth}. */
export function AuthenticatedShell() {
  return (
    <StoreProvider>
      <Outlet />
    </StoreProvider>
  );
}
