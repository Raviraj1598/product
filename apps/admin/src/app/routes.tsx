import { createBrowserRouter } from 'react-router';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminLandingPages from './pages/admin/AdminLandingPages';
import AdminStoreSettings from './pages/admin/AdminStoreSettings';
import AdminHeaderFooter from './pages/admin/AdminHeaderFooter';
import AdminLogin from './pages/admin/AdminLogin';
import NotFound from './pages/NotFound';
import { RequireAuth } from './auth/RequireAuth';
import { AuthenticatedShell } from './auth/AuthenticatedShell';

export const router = createBrowserRouter([
  { path: '/login', Component: AdminLogin },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AuthenticatedShell />,
        children: [
      {
        path: '/',
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: 'products', Component: AdminProducts },
          { path: 'orders', Component: AdminOrders },
          { path: 'customers', Component: AdminCustomers },
          { path: 'categories', Component: AdminCategories },
          { path: 'coupons', Component: AdminCoupons },
          { path: 'reviews', Component: AdminReviews },
          { path: 'header-footer', Component: AdminHeaderFooter },
          { path: 'pages', Component: AdminLandingPages },
          { path: 'settings', Component: AdminStoreSettings },
        ],
      },
        ],
      },
    ],
  },
  { path: '*', Component: NotFound },
]);
