import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomerAuth } from '../../auth/CustomerAuthContext';

const fld =
  'w-full px-3 py-2.5 border border-[var(--boutique-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--boutique-primary)] text-sm bg-white';

export default function CustomerLogin() {
  const { login, status } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to={from} replace />;
  }

  if (status === 'loading') {
    return <p className="text-center py-16 text-muted-foreground">Loading…</p>;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email.trim(), password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex w-12 h-12 rounded-full bg-[var(--luxury-cream)] items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-[var(--luxury-maroon)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--boutique-primary)]">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-2">Access orders and saved delivery details.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-[var(--boutique-border)] p-6 space-y-4 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <div className="relative mt-1">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${fld} pl-9`}
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${fld} mt-1`}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-[var(--boutique-primary)] text-white font-medium hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        New here?{' '}
        <Link to="/register" className="text-[var(--boutique-primary)] font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
