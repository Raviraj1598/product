import { RouterProvider } from 'react-router';
import { StoreProvider } from '@boutique/shared';
import { router } from './routes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </StoreProvider>
  );
}
