import { createBrowserRouter } from 'react-router';
import StoreLayout from './layouts/StoreLayout';
import FashionHome from './pages/store/FashionHome';
import StoreFront from './pages/store/StoreFront';
import ProductDetail from './pages/store/ProductDetail';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import DynamicStorePage from './pages/store/DynamicStorePage';
import CustomerLogin from './pages/account/CustomerLogin';
import CustomerRegister from './pages/account/CustomerRegister';
import CustomerAccount from './pages/account/CustomerAccount';
import CustomerOrders from './pages/account/CustomerOrders';
import CustomerOrderDetail from './pages/account/CustomerOrderDetail';
import NotFound from './pages/NotFound';
import { RequireCustomer } from './auth/RequireCustomer';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: StoreLayout,
    children: [
      { index: true, Component: FashionHome },
      { path: 'shop', Component: StoreFront },
      { path: 'product/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'p/:slug', Component: DynamicStorePage },
      { path: 'login', Component: CustomerLogin },
      { path: 'register', Component: CustomerRegister },
      {
        element: <RequireCustomer />,
        children: [
          { path: 'account', Component: CustomerAccount },
          { path: 'account/orders', Component: CustomerOrders },
          { path: 'account/orders/:orderId', Component: CustomerOrderDetail },
        ],
      },
    ],
  },
  { path: '*', Component: NotFound },
]);
