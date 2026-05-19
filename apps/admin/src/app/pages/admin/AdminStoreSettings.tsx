import { useEffect, useState } from 'react';
import type {
  CheckoutPaymentGateway,
  PaymentMethodConfig,
  ShippingMethodConfig,
  StoreSettings,
  StoreThemeTokens,
} from '@boutique/shared';
import {
  coercePaymentGateway,
  defaultPaymentMethods,
  defaultShippingMethods,
  mergeStoreSettings,
  useStore,
} from '@boutique/shared';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

const fld =
  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm bg-white';

const radiusOptions: StoreThemeTokens['radius'][] = ['none', 'sm', 'md', 'lg', 'xl'];

const GATEWAYS: CheckoutPaymentGateway[] = ['cod', 'stripe_sandbox_placeholder', 'card_collect_demo'];

const THEME_ROWS: ReadonlyArray<{
  key: keyof Omit<StoreThemeTokens, 'radius'>;
  label: string;
  colorWheel: boolean;
}> = [
  { key: 'primary', label: 'Primary brand', colorWheel: true },
  { key: 'accent', label: 'Accent / highlights', colorWheel: true },
  { key: 'surface', label: 'Section wash', colorWheel: true },
  { key: 'bandDark', label: 'Header / footer band', colorWheel: true },
  { key: 'pageBackground', label: 'Page canvas', colorWheel: true },
  { key: 'foreground', label: 'Body text', colorWheel: true },
  { key: 'border', label: 'Border / rulers (rgba/CSS colour)', colorWheel: false },
];

export default function AdminStoreSettings() {
  const { settings, setSettings } = useStore();
  const [draft, setDraft] = useState<StoreSettings>(() => mergeStoreSettings(settings));

  useEffect(() => {
    setDraft(mergeStoreSettings(settings));
  }, [settings]);

  const mergedTheme = (): StoreThemeTokens => mergeStoreSettings(draft).theme;

  const patchTheme = (patch: Partial<StoreThemeTokens>) =>
    setDraft((d) => ({
      ...d,
      theme: { ...mergeStoreSettings(d).theme, ...patch },
    }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(draft);
    toast.success('Store settings saved!');
  };

  const updatePolicies = (value: string) => {
    setDraft((prev) => ({
      ...prev,
      productPolicyLines: value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }));
  };

  const shippingLanes = draft.shippingMethods ?? defaultShippingMethods();
  const paymentRails = draft.paymentMethods ?? defaultPaymentMethods();

  const patchShip = (ix: number, patch: Partial<ShippingMethodConfig>) => {
    setDraft((d) => {
      const lanes = [...(d.shippingMethods ?? defaultShippingMethods())];
      lanes[ix] = { ...lanes[ix], ...patch } as ShippingMethodConfig;
      return { ...d, shippingMethods: lanes };
    });
  };

  const addShipping = () => {
    setDraft((d) => ({
      ...d,
      shippingMethods: [
        ...(d.shippingMethods ?? defaultShippingMethods()),
        {
          id: crypto.randomUUID().slice(0, 12),
          label: 'Custom lane',
          amount: d.shippingFlatRate,
          qualifyForFreeShippingTier: false,
        },
      ],
    }));
  };

  const removeShipping = (ix: number) => {
    setDraft((d) => {
      const lanes = [...(d.shippingMethods ?? [])];
      lanes.splice(ix, 1);
      return { ...d, shippingMethods: lanes.length ? lanes : defaultShippingMethods() };
    });
  };

  const patchPayment = (ix: number, patch: Partial<PaymentMethodConfig>) =>
    setDraft((d) => {
      const rails = [...(d.paymentMethods ?? defaultPaymentMethods())];
      rails[ix] = { ...rails[ix], ...patch } as PaymentMethodConfig;
      return { ...d, paymentMethods: rails };
    });

  const themeTokens = mergedTheme();

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Store Settings</h1>
        <p className="text-gray-600 leading-relaxed max-w-[46rem]">
          Controls what shoppers see live: typography colours, gradients, fulfilment ladders, checkout rails — versioned via
          SQLite on the Boutique API alongside products &amp; orders.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm border p-8 space-y-10">
        <section>
          <h2 className="text-lg font-semibold mb-4">Brand &amp; copy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Site name</label>
              <input
                type="text"
                value={draft.siteName}
                onChange={(e) => setDraft((s) => ({ ...s, siteName: e.target.value }))}
                className={fld}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Announcement bar</label>
              <input
                type="text"
                value={draft.announcementBar}
                onChange={(e) => setDraft((s) => ({ ...s, announcementBar: e.target.value }))}
                className={fld}
                placeholder="Optional banner under navbar"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 mt-6 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Homepage headline</label>
              <input
                type="text"
                value={draft.storefrontTitle}
                onChange={(e) => setDraft((s) => ({ ...s, storefrontTitle: e.target.value }))}
                className={fld}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Homepage subtitle</label>
              <input
                type="text"
                value={draft.storefrontSubtitle}
                onChange={(e) => setDraft((s) => ({ ...s, storefrontSubtitle: e.target.value }))}
                className={fld}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Theme palette</h2>
          <p className="text-sm text-gray-600 mb-4">
            Drives storefront CSS vars (<code className="text-xs bg-gray-100 rounded px-1">--boutique-*</code> + legacy ethnic
            tokens) after each catalog sync.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {THEME_ROWS.map((row) => {
              const value = themeTokens[row.key];
              return (
                <label key={row.key} className="block space-y-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  {row.label}
                  <div className="flex gap-2 items-center">
                    {row.colorWheel ? (
                      <input
                        type="color"
                        className="h-10 w-14 cursor-pointer rounded border"
                        value={typeof value === 'string' && value.startsWith('#') ? value.slice(0, 7) : '#ffffff'}
                        onChange={(e) =>
                          patchTheme({
                            [row.key]: e.target.value,
                          } as Partial<StoreThemeTokens>)
                        }
                      />
                    ) : null}
                    <input
                      type="text"
                      className={`${fld} font-mono text-xs`}
                      value={value}
                      onChange={(e) =>
                        patchTheme({
                          [row.key]: e.target.value,
                        } as Partial<StoreThemeTokens>)
                      }
                    />
                  </div>
                </label>
              );
            })}
            <label className="block md:col-span-2 text-xs font-semibold uppercase tracking-wide text-gray-600 space-y-2">
              Corner rounding preset
              <select
                className={fld}
                value={themeTokens.radius}
                onChange={(e) =>
                  patchTheme({ radius: e.target.value as StoreThemeTokens['radius'] })
                }
              >
                {radiusOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Checkout math</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tax (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={draft.taxPercent}
                onChange={(e) => setDraft((s) => ({ ...s, taxPercent: parseFloat(e.target.value) || 0 }))}
                className={fld}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Free shipping from ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={draft.freeShippingMin}
                onChange={(e) => setDraft((s) => ({ ...s, freeShippingMin: parseFloat(e.target.value) || 0 }))}
                className={fld}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Legacy flat shipping fallback ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={draft.shippingFlatRate}
                onChange={(e) => setDraft((s) => ({ ...s, shippingFlatRate: parseFloat(e.target.value) || 0 }))}
                className={fld}
              />
              <p className="text-[11px] text-gray-500 mt-2">
                Used when storefront cannot resolve a curated lane yet (backward compatible).
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Shipping ladders</h2>
              <p className="text-sm text-gray-600 mt-1">Buyer selects exactly one fulfilment tier at checkout.</p>
            </div>
            <button
              type="button"
              className="text-sm px-4 py-2 border rounded-xl flex items-center gap-2 hover:bg-gray-900 hover:text-white transition-colors"
              onClick={addShipping}
            >
              <Plus className="w-4 h-4" /> Lane
            </button>
          </div>
          <div className="space-y-4">
            {shippingLanes.map((lane, ix) => (
              <div key={lane.id} className="border rounded-xl p-4 grid lg:grid-cols-12 gap-3 bg-gray-50/40">
                <label className="lg:col-span-5 space-y-1">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Presentation copy</span>
                  <input className={fld} value={lane.label} onChange={(e) => patchShip(ix, { label: e.target.value })} />
                </label>
                <label className="lg:col-span-3 space-y-1">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Flat fare ($)</span>
                  <input
                    type="number"
                    className={fld}
                    value={lane.amount}
                    onChange={(e) => patchShip(ix, { amount: parseFloat(e.target.value) || 0 })}
                  />
                </label>
                <label className="lg:col-span-3 flex items-center gap-2 pt-8">
                  <input
                    type="checkbox"
                    checked={lane.qualifyForFreeShippingTier}
                    onChange={(e) => patchShip(ix, { qualifyForFreeShippingTier: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Honor free-tier</span>
                </label>
                <div className="lg:col-span-1 pt-8 flex lg:justify-end">
                  <button
                    type="button"
                    className="text-red-600 hover:underline inline-flex gap-1 text-sm items-center"
                    onClick={() => removeShipping(ix)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Payments &amp; processors</h2>
          <p className="text-sm text-gray-600 mb-4">
            Only enabled gateways appear storefront-side. COD is parity with classic Magento bank transfer flows —
            integrations like Stripe intentionally stay sandbox-only here.
          </p>
          <div className="space-y-3">
            {paymentRails.map((rail, ix) => (
              <div key={`${rail.id}-${ix}`} className="border rounded-xl px-4 py-3 md:flex md:justify-between md:items-center gap-4">
                <div className="flex-1 space-y-2">
                  <div className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">Rail {ix + 1}</div>
                  <div className="grid md:grid-cols-[200px_auto] gap-4">
                    <select
                      className={fld}
                      value={coercePaymentGateway(rail.id)}
                      onChange={(e) =>
                        patchPayment(ix, { id: coercePaymentGateway(e.target.value) })
                      }
                    >
                      {GATEWAYS.map((g) => (
                        <option key={g} value={g}>
                          {g.replace(/_/g, ' · ')}
                        </option>
                      ))}
                    </select>
                    <input
                      className={fld}
                      value={rail.label}
                      onChange={(e) => patchPayment(ix, { label: e.target.value })}
                    />
                  </div>
                </div>
                <label className="flex md:flex-col md:items-end gap-2 text-sm mt-4 md:mt-0">
                  <span className="text-xs uppercase text-gray-500">visible</span>
                  <input
                    type="checkbox"
                    checked={rail.enabled}
                    onChange={(e) => patchPayment(ix, { enabled: e.target.checked })}
                  />
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium">Stripe publishable key · pk_… </label>
            <input
              className={`${fld} font-mono text-[11px]`}
              placeholder="pk_test_live_like_string"
              value={draft.stripePublishableKey ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, stripePublishableKey: e.target.value }))}
            />
            <p className="text-xs text-gray-500">
              Client-safe key only — never stash secret signing keys beside your catalog envelope.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Footer</h2>
          <label className="block text-sm font-medium mb-2">Footer strapline</label>
          <input
            type="text"
            value={draft.footerText}
            onChange={(e) => setDraft((s) => ({ ...s, footerText: e.target.value }))}
            className={fld}
          />
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Product policy lines</h2>
          <textarea
            rows={5}
            value={draft.productPolicyLines.join('\n')}
            onChange={(e) => updatePolicies(e.target.value)}
            className={`${fld} font-mono text-sm`}
          />
        </section>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-neutral-900 transition-colors"
        >
          <Save className="w-5 h-5" /> Save catalog configuration
        </button>
      </form>
    </div>
  );
}
