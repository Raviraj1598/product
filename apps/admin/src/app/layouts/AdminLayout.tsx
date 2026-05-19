import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Tag,
  ArrowLeft,
  MessageSquare,
  Settings,
  Layers,
  LogOut,
  Users,
} from 'lucide-react';
import { storefrontHref } from '../lib/externalUrls';
import { useAuth } from '../auth/AuthContext';

type NavItem = { path: string; icon: typeof LayoutDashboard; label: string };
type NavSection = { heading: string; items: NavItem[] };

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const sections: NavSection[] = [
    {
      heading: 'Overview',
      items: [{ path: '/', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
      heading: 'Catalog',
      items: [
        { path: '/products', icon: Package, label: 'Products' },
        { path: '/categories', icon: FolderTree, label: 'Categories' },
      ],
    },
    {
      heading: 'Commerce',
      items: [
        { path: '/orders', icon: ShoppingBag, label: 'Orders & invoices' },
        { path: '/customers', icon: Users, label: 'Customers' },
        { path: '/coupons', icon: Tag, label: 'Coupons' },
        { path: '/reviews', icon: MessageSquare, label: 'Reviews' },
      ],
    },
    {
      heading: 'Storefront',
      items: [{ path: '/pages', icon: Layers, label: 'Pages' }],
    },
    {
      heading: 'Stores',
      items: [{ path: '/settings', icon: Settings, label: 'Configuration' }],
    },
  ];

  const isNavActive = (navPath: string) =>
    navPath === '/'
      ? location.pathname === '/'
      : location.pathname === navPath || location.pathname.startsWith(`${navPath}/`);

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-tight">Boutique Admin</h1>
          <p className="text-xs text-gray-500 mt-1 truncate" title={user?.email}>
            {user?.displayName || user?.email || 'Signed in'}
          </p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.heading}>
                <p className="px-4 mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {section.heading}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavActive(item.path);
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                            isActive
                              ? 'bg-gray-800 text-white'
                              : 'text-gray-400 hover:bg-gray-800/80 hover:text-white'
                          }`}
                        >
                          <Icon className="w-5 h-5 shrink-0 opacity-90" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-1">
          <a
            href={storefrontHref('/')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>View storefront</span>
          </a>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-gray-50 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
