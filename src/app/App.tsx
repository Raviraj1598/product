import { RouterProvider } from 'react-router';
import { router } from './routes';
import { StoreProvider } from './context/StoreContext';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <StoreProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </StoreProvider>
  );
}