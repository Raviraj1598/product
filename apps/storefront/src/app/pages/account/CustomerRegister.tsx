import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomerAuth } from '../../auth/CustomerAuthContext';

const fld =
  'w-full px-3 py-2.5 border border-[var(--boutique-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--boutique-primary)] text-sm bg-white';

export default function CustomerRegister() {
  const { register, status } = useCustomerAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    addressLine1: '',
    city: '',
    zipCode: '',
    country: '',
  });

  if (status === 'authenticated') {
    return <Navigate to="/account" replace />;
  }

  if (status === 'loading') {
    return <p className="text-center py-16 text-muted-foreground">Loading…</p>;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await register(form);
      toast.success('Account created');
      navigate('/account', { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex w-12 h-12 rounded-full bg-[var(--luxury-cream)] items-center justify-center mb-4">
          <UserPlus className="w-6 h-6 text-[var(--luxury-maroon)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--boutique-primary)]">Create account</h1>
        <p className="text-sm text-muted-foreground mt-2">Register to track orders and save your address.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white rounded-xl border border-[var(--boutique-border)] p-6 space-y-4 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium">Full name *</span>
          <input required value={form.name} onChange={set('name')} className={`${fld} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email *</span>
          <input type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={`${fld} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password * (min 8)</span>
          <input type="password" required autoComplete="new-password" value={form.password} onChange={set('password')} className={`${fld} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Phone</span>
          <input value={form.phone} onChange={set('phone')} className={`${fld} mt-1`} />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Address</span>
          <input value={form.addressLine1} onChange={set('addressLine1')} className={`${fld} mt-1`} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium">City</span>
            <input value={form.city} onChange={set('city')} className={`${fld} mt-1`} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">ZIP</span>
            <input value={form.zipCode} onChange={set('zipCode')} className={`${fld} mt-1`} />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Country</span>
          <input value={form.country} onChange={set('country')} className={`${fld} mt-1`} />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-[var(--boutique-primary)] text-white font-medium hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--boutique-primary)] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
