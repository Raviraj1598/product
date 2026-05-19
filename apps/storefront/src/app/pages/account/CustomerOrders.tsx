import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { Order } from '@boutique/shared';
import { fetchMyOrders } from '@boutique/shared';
import { ChevronRight, Package } from 'lucide-react';

const statusColor: Record<Order['status'], string> = {
  pending: 'bg-gray-100 text-gray-800',
  processing: 'bg-yellow-100 text-yellow-800',
  shipped: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchMyOrders();
        if (!cancelled) setOrders(list);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link to="/account" className="text-sm text-[var(--boutique-primary)] hover:underline">
          ← Back to account
        </Link>
        <h1 className="text-2xl font-bold text-[var(--boutique-primary)] mt-2 flex items-center gap-2">
          <Package className="w-7 h-7" />
          Your orders
        </h1>
      </div>

      {loading && <p className="text-muted-foreground">Loading orders…</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className="text-muted-foreground">No orders yet. <Link to="/shop" className="underline">Start shopping</Link></p>
      )}

      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              to={`/account/orders/${order.id}`}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-[var(--boutique-border)] bg-white hover:border-[var(--boutique-primary)] transition-colors"
            >
              <div>
                <div className="font-medium">
                  {order.invoiceNumber ? order.invoiceNumber : `Order #${order.id.slice(0, 8)}`}
                </div>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString()} · ${order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor[order.status]}`}>
                  {order.status}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
