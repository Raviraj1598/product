import { createBrowserRouter } from 'react-router';
import StoreLayout from './layouts/StoreLayout';
import FashionHome from './pages/store/FashionHome';
import StoreFront from './pages/store/StoreFront';
import ProductDetail from './pages/store/ProductDetail';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import DynamicStorePage from './pages/store/DynamicStorePage';
import NotFound from './pages/NotFound';

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
    ],
  },
  { path: '*', Component: NotFound },
]);
