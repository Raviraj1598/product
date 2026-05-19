import { useMemo, useState } from 'react';
import { useStore } from '@boutique/shared';
import type { Customer } from '@boutique/shared';
import { Search, Users, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCustomers() {
  const { customers, setCustomers, orders } = useStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const orderCount = (customerId: string, email: string) =>
    orders.filter(
      (o) => o.customerId === customerId || o.customerEmail.toLowerCase() === email.toLowerCase(),
    ).length;

  const handleDelete = (id: string) => {
    if (!confirm('Remove this customer profile from catalog? Login credentials remain until server cleanup.')) {
      return;
    }
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (selected?.id === id) setSelected(null);
    toast.success('Customer removed from catalog');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="w-8 h-8" />
          Customers
        </h1>
        <p className="text-gray-600">
          {customers.length} registered shoppers · passwords stored securely on the API server
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg border shadow-sm divide-y max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">No customers match.</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c)}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selected?.id === c.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="font-medium">{c.name}</div>
                <p className="text-sm text-gray-500 truncate">{c.email}</p>
                <p className="text-xs text-gray-400 mt-1">{orderCount(c.id, c.email)} orders</p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg border shadow-sm p-6 min-h-[320px]">
          {!selected ? (
            <p className="text-gray-500">Select a customer to view profile.</p>
          ) : (
            <>
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <p className="text-sm text-gray-500 font-mono">{selected.id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(selected.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove profile
                </button>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <dt className="text-gray-500 w-24">Email</dt>
                  <dd>{selected.email}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <dt className="text-gray-500 w-24">Phone</dt>
                  <dd>{selected.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 mb-1">Address</dt>
                  <dd>
                    {[selected.addressLine1, selected.city, selected.zipCode, selected.country]
                      .filter(Boolean)
                      .join(', ') || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Joined</dt>
                  <dd>{new Date(selected.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Orders</dt>
                  <dd>{orderCount(selected.id, selected.email)}</dd>
                </div>
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
