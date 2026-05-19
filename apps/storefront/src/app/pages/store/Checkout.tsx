import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  checkoutTotals,
  coercePaymentGateway,
  mergeStoreSettings,
  primaryShippingMethodId,
  useStore,
} from '@boutique/shared';
import type { CheckoutPaymentGateway, Order } from '@boutique/shared';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Checkout() {
  const { cart, products, settings, clearCart, submitOrderToServer } = useStore();
  const merged = mergeStoreSettings(settings);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const shippingLanes = merged.shippingMethods ?? [];
  const paymentLanes = merged.paymentMethods?.filter((p) => p.enabled) ?? [];

  const [shippingId, setShippingId] = useState<string | undefined>(
    primaryShippingMethodId(merged) ?? shippingLanes[0]?.id,
  );
  const [paymentId, setPaymentId] = useState<CheckoutPaymentGateway>(() => {
    const first = paymentLanes[0]?.id ?? 'cod';
    return coercePaymentGateway(first);
  });

  useEffect(() => {
    const stillShip = shippingLanes.some((m) => m.id === shippingId);
    if (!stillShip && shippingLanes[0]) setShippingId(shippingLanes[0].id);

    const stillPay = paymentLanes.some((p) => p.id === paymentId);
    if (!stillPay && paymentLanes[0]) setPaymentId(coercePaymentGateway(paymentLanes[0].id));
    if (paymentLanes.length === 0) setPaymentId('cod');
  }, [shippingLanes, paymentLanes, shippingId, paymentId]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const cartItems = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const { tax, shipping, total } = useMemo(
    () =>
      checkoutTotals({
        settings: merged,
        subtotal,
        shippingMethodId: shippingId,
        discount: 0,
      }),
    [merged, shippingId, subtotal],
  );

  const shipLabel =
    merged.shippingMethods.find((m) => m.id === shippingId)?.label ?? merged.shippingMethods[0]?.label ?? 'Standard';

  const payLabel =
    paymentLanes.find((p) => coercePaymentGateway(p.id) === paymentId)?.label ??
    ({ cod: 'Cash on delivery', stripe_sandbox_placeholder: 'Stripe (sandbox)', card_collect_demo: 'Card demo' }[
      paymentId
    ] ?? 'Checkout');

  const needsCardCollect = paymentId === 'card_collect_demo';
  const showStripeRail = paymentId === 'stripe_sandbox_placeholder';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (needsCardCollect && (!formData.cardNumber.trim() || !formData.expiryDate.trim() || !formData.cvv.trim())) {
      toast.error('Enter card details or choose COD.');
      return;
    }

    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, showStripeRail ? 800 : 500));

    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: Date.now().toString(),
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.product?.name || '',
        quantity: item.quantity,
        price: item.product?.price || 0,
        selectedVariants: item.selectedVariants,
      })),
      subtotal,
      tax,
      shipping,
      discount: 0,
      total,
      customerName: formData.name,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
      status: 'pending',
      createdAt: nowIso,
      updatedAt: nowIso,
      shippingMethodId: shippingId,
      shippingMethodLabel: shipLabel,
      paymentMethodId: paymentId,
      paymentMethodLabel: payLabel,
      notes:
        paymentId === 'stripe_sandbox_placeholder'
          ? 'Paid via Stripe-ready placeholder (sandbox not configured)'
          : needsCardCollect
            ? `Simulated PAN capture ending ${formData.cardNumber.replace(/\s/g, '').slice(-4) || 'XXXX'}`
            : paymentId === 'cod'
              ? 'COD — settle with courier'
              : undefined,
    };

    try {
      await submitOrderToServer(newOrder);
      clearCart();
      setOrderPlaced(true);
      setTimeout(() => navigate('/'), 3200);
    } catch {
      toast.error('Could not place order. Make sure the store API is running (npm run dev).');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-600" />
        <h1 className="text-3xl font-bold mb-4 text-[var(--boutique-primary)]">Order placed</h1>
        <p className="text-gray-600 mb-2">Thanks — fulfillment will follow shortly.</p>
        <p className="text-sm text-gray-500 mb-8">Returning you to home…</p>
      </div>
    );
  }

  const ringCls = 'rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--boutique-primary)]';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2 text-[var(--boutique-primary)]">Checkout</h1>
      <p className="text-muted-foreground text-sm mb-8 max-w-xl">
        Shipping &amp; payment methods are{' '}
        <strong>configured live from your admin dashboard</strong> — what you tune in Settings is reflected here instantly
        once saved.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-[var(--boutique-page-bg)] rounded-xl border shadow-sm border-[var(--boutique-border)] p-6 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Delivery</h2>
              <div className="space-y-3">
                {shippingLanes.map((lane) => (
                  <label
                    key={lane.id}
                    className={`flex gap-3 border rounded-xl p-3 cursor-pointer ${shippingId === lane.id ? 'border-[var(--boutique-primary)] bg-[color-mix(in_srgb,var(--boutique-surface)_80%,transparent)]' : ''}`}
                  >
                    <input
                      type="radio"
                      name="ship-lane"
                      checked={shippingId === lane.id}
                      onChange={() => setShippingId(lane.id)}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{lane.label}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {lane.qualifyForFreeShippingTier
                          ? `Uses free-shipping tiers from ${merged.freeShippingMin} subtotal`
                          : 'Excluded from tiered free shipping'}{' '}
                        · base fare ${lane.amount.toFixed(2)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Phone (optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Shipping address</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Postal code</label>
                  <input
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Payment</h2>

              <div className="space-y-3 mb-6">
                {paymentLanes.map((lane) => {
                  const gid = coercePaymentGateway(lane.id);
                  return (
                    <label
                      key={lane.id}
                      className={`flex gap-3 border rounded-xl p-3 cursor-pointer ${paymentId === gid ? 'border-[var(--boutique-accent)] bg-[color-mix(in_srgb,var(--boutique-surface)_82%,transparent)]' : ''}`}
                    >
                      <input
                        type="radio"
                        name="pay-lane"
                        checked={paymentId === gid}
                        onChange={() => setPaymentId(gid)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{lane.label}</div>
                      </div>
                    </label>
                  );
                })}
                {paymentLanes.length === 0 ? (
                  <p className="text-sm text-muted-foreground border rounded-lg px-4 py-3">
                    Configure payment rails in Admin → Store Settings. Falling back to <strong>COD</strong>.
                  </p>
                ) : null}
              </div>

              {merged.stripePublishableKey?.trim() && paymentId === 'stripe_sandbox_placeholder' ? (
                <p className="text-[11px] text-muted-foreground mb-4">
                  Publishable preview:{' '}
                  <code className="font-mono break-all">{merged.stripePublishableKey.trim().slice(0, 28)}…</code>
                  <span className="block mt-2">
                    Add your Elements / Checkout session separately — secrets never ride on this endpoint.
                  </span>
                </p>
              ) : showStripeRail ? (
                <p className="text-[11px] text-muted-foreground mb-4">
                  Stripe publishable key not set in admin — this rail is illustrative only until you paste the pk_ key for
                  your environment.
                </p>
              ) : null}

              {showStripeRail ? (
                <div className="rounded-xl border border-dashed border-[var(--boutique-border)] px-5 py-4 text-sm text-muted-foreground bg-[color-mix(in_srgb,var(--boutique-surface)_70%,white)] mb-6">
                  Simulates redirect to Stripe Hosted Checkout · no live charge happens in this scaffold.
                </div>
              ) : null}

              {needsCardCollect ? (
                <div className="space-y-4">
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Demo only — PAN data is not vaulted and should never mirror production UX without PCI-compliant
                    tooling.
                  </p>
                  <div>
                    <label className="block text-sm font-medium mb-2">Card number</label>
                    <input
                      type="text"
                      required={needsCardCollect}
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      autoComplete="off"
                      className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry</label>
                      <input
                        type="text"
                        required={needsCardCollect}
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                        className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        required={needsCardCollect}
                        placeholder="123"
                        value={formData.cvv}
                        onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                        className={`w-full px-3 py-2 border border-[var(--boutique-border)] ${ringCls}`}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

            </section>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-[var(--boutique-primary)] text-[var(--boutique-page-bg)] px-6 py-3 rounded-xl hover:opacity-90 transition-opacity font-semibold tracking-tight disabled:opacity-50"
              style={{
                borderRadius: 'var(--boutique-radius, 0.5rem)',
              }}
            >
              {isProcessing ? 'Completing checkout…' : `Place order · $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        <div>
          <div className="bg-[var(--boutique-page-bg)] rounded-xl border shadow-sm border-[var(--boutique-border)] p-6 sticky top-24 transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>

            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <img
                    src={item.product?.images?.[0]}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-snug truncate">{item.product?.name}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold whitespace-nowrap">
                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <dl className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax ({merged.taxPercent}%)</dt>
                <dd>${tax.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping ({shipLabel})</dt>
                <dd>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Payment rail</dt>
                <dd className="text-right">{payLabel}</dd>
              </div>
            </dl>

            <div className="border-t mt-6 pt-4 flex justify-between items-baseline gap-4">
              <span className="text-lg font-semibold">Due today</span>
              <span className="text-3xl font-bold text-[var(--boutique-primary)]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
