import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { LogOut, Package, User } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomerAuth } from '../../auth/CustomerAuthContext';

const fld =
  'w-full px-3 py-2 border border-[var(--boutique-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--boutique-primary)] text-sm';

export default function CustomerAccount() {
  const { user, logout, updateProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    city: '',
    zipCode: '',
    country: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name,
      phone: user.phone,
      addressLine1: user.addressLine1,
      city: user.city,
      zipCode: user.zipCode,
      country: user.country,
    });
  }, [user]);

  if (!user) return null;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
    toast.message('Signed out');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--boutique-primary)] flex items-center gap-2">
            <User className="w-7 h-7" />
            My account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 text-sm border rounded-lg px-3 py-2 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      <Link
        to="/account/orders"
        className="flex items-center gap-3 mb-8 p-4 rounded-xl border border-[var(--boutique-border)] bg-white hover:border-[var(--boutique-primary)] transition-colors"
      >
        <Package className="w-6 h-6 text-[var(--luxury-maroon)]" />
        <div>
          <div className="font-medium">Order history</div>
          <p className="text-sm text-muted-foreground">View status, invoices, and tracking</p>
        </div>
      </Link>

      <form onSubmit={onSave} className="bg-white rounded-xl border border-[var(--boutique-border)] p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-lg">Delivery profile</h2>
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={`${fld} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Phone</span>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={`${fld} mt-1`}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Address</span>
          <input
            value={form.addressLine1}
            onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
            className={`${fld} mt-1`}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium">City</span>
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className={`${fld} mt-1`}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">ZIP</span>
            <input
              value={form.zipCode}
              onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))}
              className={`${fld} mt-1`}
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Country</span>
          <input
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            className={`${fld} mt-1`}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full py-2.5 rounded-lg bg-[var(--boutique-primary)] text-white font-medium disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}
