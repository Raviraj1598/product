import type { StoreSettings } from '../types';

/** First configured lane preview (cart summary). Checkout lets shoppers change this. */
export function primaryShippingMethodId(settings: StoreSettings): string | undefined {
  return settings.shippingMethods[0]?.id;
}

export function resolveShippingCharge(
  settings: StoreSettings,
  subtotalAfterDiscounts: number,
  shippingMethodId: string | null | undefined,
): number {
  const methods = settings.shippingMethods ?? [];
  const selected =
    shippingMethodId && methods.length > 0 ? methods.find((m) => m.id === shippingMethodId) ?? null : null;

  if (selected) {
    let charge = selected.amount;
    if (selected.qualifyForFreeShippingTier && subtotalAfterDiscounts >= settings.freeShippingMin) {
      charge = 0;
    }
    return charge;
  }

  return subtotalAfterDiscounts >= settings.freeShippingMin ? 0 : settings.shippingFlatRate;
}

/** Tax applies to subtotal − discounts (checkout/cart previews without coupon subtract here). */
export function checkoutTotals(opts: {
  settings: StoreSettings;
  subtotal: number;
  shippingMethodId?: string | null;
  discount?: number;
}) {
  const discount = Math.max(0, opts.discount ?? 0);
  const netSubtotal = Math.max(0, opts.subtotal - discount);
  const tax = netSubtotal * (opts.settings.taxPercent / 100);
  const shipping = resolveShippingCharge(opts.settings, netSubtotal, opts.shippingMethodId);
  const total = netSubtotal + tax + shipping;
  return {
    subtotal: opts.subtotal,
    discount,
    tax,
    shipping,
    total,
  };
}

/** @deprecated Prefer checkoutTotals — kept for callers that omit shipping lanes. */
export function orderTotalsFromSubtotal(settings: StoreSettings, subtotal: number) {
  return checkoutTotals({
    settings,
    subtotal,
    shippingMethodId: primaryShippingMethodId(settings),
    discount: 0,
  });
}
