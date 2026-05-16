import { Outlet, Link } from 'react-router';
import { ShoppingCart, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function StoreLayout() {
  const { cart } = useStore();
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Store className="w-6 h-6" />
              <span className="text-xl font-semibold">My Store</span>
            </Link>

            <nav className="flex items-center gap-6">
              <Link to="/" className="hover:text-gray-600 transition-colors">
                Products
              </Link>
              <Link to="/admin" className="hover:text-gray-600 transition-colors">
                Admin
              </Link>
              <Link to="/cart" className="relative hover:text-gray-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-50 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 text-sm">
            © 2026 My Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
