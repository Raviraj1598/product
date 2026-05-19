import type { Order } from '@boutique/shared';
import { mergeStoreSettings, useStore } from '@boutique/shared';

interface OrderInvoiceProps {
  order: Order;
  className?: string;
}

/** Printable invoice block for admin order detail. */
export function OrderInvoice({ order, className = '' }: OrderInvoiceProps) {
  const { settings } = useStore();
  const merged = mergeStoreSettings(settings);

  return (
    <div className={`bg-white text-gray-900 ${className}`} id={`invoice-${order.id}`}>
      <header className="border-b pb-4 mb-4">
        <h2 className="text-xl font-bold">{merged.siteName}</h2>
        <p className="text-sm text-gray-500">Invoice / receipt</p>
        <p className="text-lg font-semibold mt-2">
          {order.invoiceNumber ?? `Order #${order.id.slice(0, 8)}`}
        </p>
        <p className="text-sm text-gray-600">
          Date: {new Date(order.createdAt).toLocaleString()} · Status:{' '}
          <span className="capitalize">{order.status}</span>
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6 text-sm mb-6">
        <div>
          <h3 className="font-semibold mb-2">Bill to</h3>
          <p>{order.customerName}</p>
          <p>{order.customerEmail}</p>
          <p>{order.customerPhone}</p>
          <p className="mt-1">{order.customerAddress}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Fulfillment</h3>
          {order.shippingMethodLabel && <p>Shipping: {order.shippingMethodLabel}</p>}
          {order.paymentMethodLabel && <p>Payment: {order.paymentMethodLabel}</p>}
          {order.trackingNumber && <p className="font-mono mt-1">Tracking: {order.trackingNumber}</p>}
        </div>
      </div>

      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-2 px-2">Product</th>
            <th className="text-right py-2 px-2">Qty</th>
            <th className="text-right py-2 px-2">Unit</th>
            <th className="text-right py-2 px-2">Line</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="py-2 px-2">{item.productName}</td>
              <td className="py-2 px-2 text-right">{item.quantity}</td>
              <td className="py-2 px-2 text-right">${item.price.toFixed(2)}</td>
              <td className="py-2 px-2 text-right">${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-sm space-y-1 max-w-xs ml-auto">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${order.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>${order.shipping.toFixed(2)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
            <span>-${order.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      {order.notes && (
        <p className="text-sm text-gray-600 mt-4 border-t pt-4">
          <span className="font-medium">Notes:</span> {order.notes}
        </p>
      )}
    </div>
  );
}
