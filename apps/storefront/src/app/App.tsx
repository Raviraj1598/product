import { RouterProvider } from 'react-router';
import { StoreProvider } from '@boutique/shared';
import { router } from './routes';
import { Toaster } from 'sonner';
import { CustomerAuthProvider } from './auth/CustomerAuthContext';

export default function App() {
  return (
    <StoreProvider>
      <CustomerAuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </CustomerAuthProvider>
    </StoreProvider>
  );
}
