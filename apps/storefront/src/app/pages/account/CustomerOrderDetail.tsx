import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Order } from '@boutique/shared';
import { fetchMyOrder, mergeStoreSettings, useStore } from '@boutique/shared';
import { Truck } from 'lucide-react';

export default function CustomerOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { settings } = useStore();
  const merged = mergeStoreSettings(settings);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await fetchMyOrder(orderId);
        if (!cancelled) setOrder(o);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Order not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) return <p className="text-center py-16 text-muted-foreground">Loading order…</p>;
  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error ?? 'Order not found'}</p>
        <Link to="/account/orders" className="text-[var(--boutique-primary)] underline">
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 print:py-4">
      <Link to="/account/orders" className="text-sm text-[var(--boutique-primary)] hover:underline print:hidden">
        ← Back to orders
      </Link>

      <header className="mt-4 mb-6 border-b border-[var(--boutique-border)] pb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{merged.siteName}</p>
        <h1 className="text-2xl font-bold text-[var(--boutique-primary)]">
          {order.invoiceNumber ?? `Order #${order.id.slice(0, 8)}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Placed {new Date(order.createdAt).toLocaleString()} · Status:{' '}
          <span className="capitalize font-medium">{order.status}</span>
        </p>
      </header>

      <section className="mb-6 text-sm space-y-1">
        <p>
          <span className="text-muted-foreground">Ship to:</span> {order.customerName}
        </p>
        <p>{order.customerAddress}</p>
        <p>{order.customerEmail} · {order.customerPhone}</p>
        {order.shippingMethodLabel && (
          <p>
            <span className="text-muted-foreground">Shipping:</span> {order.shippingMethodLabel}
          </p>
        )}
        {order.paymentMethodLabel && (
          <p>
            <span className="text-muted-foreground">Payment:</span> {order.paymentMethodLabel}
          </p>
        )}
        {order.trackingNumber && (
          <p className="flex items-center gap-2 mt-2">
            <Truck className="w-4 h-4" />
            Tracking: <span className="font-mono">{order.trackingNumber}</span>
          </p>
        )}
      </section>

      <table className="w-full text-sm border rounded-lg overflow-hidden mb-6">
        <thead className="bg-[var(--luxury-cream)]">
          <tr>
            <th className="text-left px-3 py-2">Item</th>
            <th className="text-right px-3 py-2">Qty</th>
            <th className="text-right px-3 py-2">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {order.items.map((item, i) => (
            <tr key={i}>
              <td className="px-3 py-2">{item.productName}</td>
              <td className="px-3 py-2 text-right">{item.quantity}</td>
              <td className="px-3 py-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t">
          <tr>
            <td colSpan={2} className="px-3 py-1 text-right text-muted-foreground">
              Subtotal
            </td>
            <td className="px-3 py-1 text-right">${order.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={2} className="px-3 py-1 text-right text-muted-foreground">
              Tax
            </td>
            <td className="px-3 py-1 text-right">${order.tax.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan={2} className="px-3 py-1 text-right text-muted-foreground">
              Shipping
            </td>
            <td className="px-3 py-1 text-right">${order.shipping.toFixed(2)}</td>
          </tr>
          {order.discount > 0 && (
            <tr>
              <td colSpan={2} className="px-3 py-1 text-right text-green-700">
                Discount
              </td>
              <td className="px-3 py-1 text-right text-green-700">-${order.discount.toFixed(2)}</td>
            </tr>
          )}
          <tr className="font-bold">
            <td colSpan={2} className="px-3 py-2 text-right">
              Total
            </td>
            <td className="px-3 py-2 text-right">${order.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      {order.notes && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Notes:</span> {order.notes}
        </p>
      )}
    </div>
  );
}
