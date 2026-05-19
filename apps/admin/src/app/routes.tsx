import { createBrowserRouter } from 'react-router';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminLandingPages from './pages/admin/AdminLandingPages';
import AdminStoreSettings from './pages/admin/AdminStoreSettings';
import AdminHeaderFooter from './pages/admin/AdminHeaderFooter';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: 'products', Component: AdminProducts },
      { path: 'orders', Component: AdminOrders },
      { path: 'categories', Component: AdminCategories },
      { path: 'coupons', Component: AdminCoupons },
      { path: 'reviews', Component: AdminReviews },
      { path: 'header-footer', Component: AdminHeaderFooter },
      { path: 'pages', Component: AdminLandingPages },
      { path: 'settings', Component: AdminStoreSettings },
    ],
  },
  { path: '*', Component: NotFound },
]);
