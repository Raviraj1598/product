import { useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../auth/AuthContext';

const fld =
  'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white';

export default function AdminLogin() {
  const { login, status } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <p className="text-sm opacity-80">Loading…</p>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast.success('Signed in');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white/10 items-center justify-center mb-4 border border-white/10">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Boutique Admin</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to manage catalog, orders, and storefront content.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-5 border border-gray-200/80"
        >
          <label className="block">
            <span className="text-sm font-semibold text-gray-800">Email</span>
            <div className="relative mt-2">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                autoComplete="username"
                required
                className={`${fld} pl-10`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourstore.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-800">Password</span>
            <div className="relative mt-2">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                className={`${fld} pl-10`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-neutral-800 disabled:opacity-60 transition-colors"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            First deploy: set <code className="bg-gray-100 px-1 rounded">ADMIN_EMAIL</code> and{' '}
            <code className="bg-gray-100 px-1 rounded">ADMIN_PASSWORD</code> on the API server before opening admin.
          </p>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          <a
            href={import.meta.env.VITE_STOREFRONT_URL || 'http://127.0.0.1:5173'}
            className="text-gray-400 hover:text-white transition-colors"
          >
            View storefront →
          </a>
        </p>
      </div>
    </div>
  );
}
