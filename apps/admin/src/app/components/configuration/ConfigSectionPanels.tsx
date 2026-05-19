import type {
  CheckoutPaymentGateway,
  PaymentMethodConfig,
  ShippingMethodConfig,
  StoreSettings,
  StoreSocialLink,
  StoreThemeTokens,
} from '@boutique/shared';
import {
  coercePaymentGateway,
  defaultFooterLegalLinks,
  defaultFooterMiddleLinks,
  defaultFooterShopLinks,
  defaultFooterSocialLinks,
  defaultHeaderNavLinks,
  defaultPaymentMethods,
  defaultShippingMethods,
  mergeStoreSettings,
} from '@boutique/shared';
import { Plus, Trash2 } from 'lucide-react';
import type { ConfigSectionId } from './configTypes';
import { configFld, ConfigFieldRow, ConfigFieldset } from './ConfigPrimitives';
import { LinkListEditor } from './LinkListEditor';

const GATEWAYS: CheckoutPaymentGateway[] = ['cod', 'stripe_sandbox_placeholder', 'card_collect_demo'];
const radiusOptions: StoreThemeTokens['radius'][] = ['none', 'sm', 'md', 'lg', 'xl'];

const THEME_ROWS: ReadonlyArray<{
  key: keyof Omit<StoreThemeTokens, 'radius'>;
  label: string;
  colorWheel: boolean;
  comment?: string;
}> = [
  { key: 'primary', label: 'Primary brand color', colorWheel: true, comment: 'Headings, buttons, key accents (--boutique-primary).' },
  { key: 'accent', label: 'Accent color', colorWheel: true, comment: 'Highlights and badges (--boutique-accent).' },
  { key: 'surface', label: 'Surface wash', colorWheel: true, comment: 'Soft section backgrounds.' },
  { key: 'bandDark', label: 'Header / footer band', colorWheel: true, comment: 'Dark navigation and footer strips.' },
  { key: 'pageBackground', label: 'Page background', colorWheel: true },
  { key: 'foreground', label: 'Body text', colorWheel: true },
  { key: 'border', label: 'Border color', colorWheel: false, comment: 'CSS color or rgba value.' },
];

export type ConfigDraftProps = {
  draft: StoreSettings;
  setDraft: React.Dispatch<React.SetStateAction<StoreSettings>>;
};

export function ConfigSectionPanels({ section, draft, setDraft }: ConfigDraftProps & { section: ConfigSectionId }) {
  const m = mergeStoreSettings(draft);
  const patchTheme = (patch: Partial<StoreThemeTokens>) =>
    setDraft((d) => ({ ...d, theme: { ...mergeStoreSettings(d).theme, ...patch } }));

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
          label: 'Custom delivery',
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

  const patchSocial = (ix: number, patch: Partial<StoreSocialLink>) => {
    const next = [...m.footerSocialLinks];
    next[ix] = { ...next[ix], ...patch } as StoreSocialLink;
    setDraft((d) => ({ ...d, footerSocialLinks: next }));
  };

  switch (section) {
    case 'general-store':
      return (
        <ConfigFieldset title="General">
          <ConfigFieldRow label="Store Name" required comment="Browser title and branding across the storefront.">
            <input className={configFld} value={draft.siteName} onChange={(e) => setDraft((s) => ({ ...s, siteName: e.target.value }))} />
          </ConfigFieldRow>
          <ConfigFieldRow label="Copyright / footer line" comment="Shown at the bottom of every page.">
            <input className={configFld} value={draft.footerText} onChange={(e) => setDraft((s) => ({ ...s, footerText: e.target.value }))} />
          </ConfigFieldRow>
        </ConfigFieldset>
      );

    case 'general-homepage':
      return (
        <ConfigFieldset title="Homepage">
          <ConfigFieldRow label="Homepage headline">
            <input className={configFld} value={draft.storefrontTitle} onChange={(e) => setDraft((s) => ({ ...s, storefrontTitle: e.target.value }))} />
          </ConfigFieldRow>
          <ConfigFieldRow label="Homepage subtitle">
            <input className={configFld} value={draft.storefrontSubtitle} onChange={(e) => setDraft((s) => ({ ...s, storefrontSubtitle: e.target.value }))} />
          </ConfigFieldRow>
        </ConfigFieldset>
      );

    case 'design-web':
      return (
        <ConfigFieldset title="Web">
          <ConfigFieldRow label="Announcement bar" comment="Slim promo strip under the header. Leave empty to use the free-shipping default.">
            <input className={configFld} value={draft.announcementBar} onChange={(e) => setDraft((s) => ({ ...s, announcementBar: e.target.value }))} placeholder="Festive edits • Free shipping over $50" />
          </ConfigFieldRow>
        </ConfigFieldset>
      );

    case 'design-theme':
      return (
        <>
          <ConfigFieldset title="Theme">
            {THEME_ROWS.map((row) => {
              const value = m.theme[row.key];
              return (
                <ConfigFieldRow key={row.key} label={row.label} comment={row.comment}>
                  <div className="flex gap-2 items-center">
                    {row.colorWheel ? (
                      <input
                        type="color"
                        className="h-10 w-14 cursor-pointer rounded border border-gray-300"
                        value={typeof value === 'string' && value.startsWith('#') ? value.slice(0, 7) : '#ffffff'}
                        onChange={(e) => patchTheme({ [row.key]: e.target.value } as Partial<StoreThemeTokens>)}
                      />
                    ) : null}
                    <input
                      type="text"
                      className={`${configFld} font-mono text-xs`}
                      value={value}
                      onChange={(e) => patchTheme({ [row.key]: e.target.value } as Partial<StoreThemeTokens>)}
                    />
                  </div>
                </ConfigFieldRow>
              );
            })}
            <ConfigFieldRow label="Corner radius preset">
              <select className={configFld} value={m.theme.radius} onChange={(e) => patchTheme({ radius: e.target.value as StoreThemeTokens['radius'] })}>
                {radiusOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </ConfigFieldRow>
          </ConfigFieldset>
        </>
      );

    case 'sales-tax':
      return (
        <ConfigFieldset title="Tax">
          <ConfigFieldRow label="Tax percent" comment="Applied to cart subtotal at checkout.">
            <input type="number" step="0.01" min="0" className={configFld} value={draft.taxPercent} onChange={(e) => setDraft((s) => ({ ...s, taxPercent: parseFloat(e.target.value) || 0 }))} />
          </ConfigFieldRow>
        </ConfigFieldset>
      );

    case 'sales-checkout':
      return (
        <ConfigFieldset title="Checkout">
          <ConfigFieldRow label="Free shipping minimum ($)" comment="Subtotal threshold before tiered free shipping applies.">
            <input type="number" step="0.01" min="0" className={configFld} value={draft.freeShippingMin} onChange={(e) => setDraft((s) => ({ ...s, freeShippingMin: parseFloat(e.target.value) || 0 }))} />
          </ConfigFieldRow>
          <ConfigFieldRow label="Legacy flat shipping ($)" comment="Fallback when no delivery method is selected.">
            <input type="number" step="0.01" min="0" className={configFld} value={draft.shippingFlatRate} onChange={(e) => setDraft((s) => ({ ...s, shippingFlatRate: parseFloat(e.target.value) || 0 }))} />
          </ConfigFieldRow>
        </ConfigFieldset>
      );

    case 'catalog-policies':
      return (
        <ConfigFieldset title="Product Policies">
          <ConfigFieldRow label="Policy lines" comment="One line per row — shown on product detail pages.">
            <textarea
              rows={6}
              className={`${configFld} font-mono text-sm`}
              value={draft.productPolicyLines.join('\n')}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  productPolicyLines: e.target.value.split('\n').map((l) => l.trim()).filter(Boolean),
                }))
              }
            />
          </ConfigFieldRow>
        </ConfigFieldset>
      );

    case 'shipping-settings':
      return (
        <ConfigFieldset title="Shipping Settings">
          <ConfigFieldRow label="Free shipping threshold" comment="Same as Sales → Checkout. Shoppers see progress toward free shipping in cart.">
            <input type="number" step="0.01" min="0" className={configFld} value={draft.freeShippingMin} onChange={(e) => setDraft((s) => ({ ...s, freeShippingMin: parseFloat(e.target.value) || 0 }))} />
          </ConfigFieldRow>
        </ConfigFieldset>
      );

    case 'shipping-methods':
      return (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button type="button" onClick={addShipping} className="text-sm px-4 py-2 border border-gray-300 rounded-sm inline-flex items-center gap-2 hover:bg-gray-900 hover:text-white">
              <Plus className="w-4 h-4" /> Add method
            </button>
          </div>
          {shippingLanes.map((lane, ix) => (
            <ConfigFieldset key={lane.id} title={lane.label || `Method ${ix + 1}`} defaultOpen={ix === 0}>
              <ConfigFieldRow label="Title">
                <input className={configFld} value={lane.label} onChange={(e) => patchShip(ix, { label: e.target.value })} />
              </ConfigFieldRow>
              <ConfigFieldRow label="Price ($)">
                <input type="number" className={configFld} value={lane.amount} onChange={(e) => patchShip(ix, { amount: parseFloat(e.target.value) || 0 })} />
              </ConfigFieldRow>
              <ConfigFieldRow label="Qualify for free shipping" comment="When enabled, shipping becomes $0 once cart subtotal exceeds the store threshold.">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={lane.qualifyForFreeShippingTier} onChange={(e) => patchShip(ix, { qualifyForFreeShippingTier: e.target.checked })} />
                  Yes
                </label>
              </ConfigFieldRow>
              <ConfigFieldRow label=" ">
                <button type="button" className="text-red-600 text-sm inline-flex items-center gap-1" onClick={() => removeShipping(ix)}>
                  <Trash2 className="w-4 h-4" /> Delete method
                </button>
              </ConfigFieldRow>
            </ConfigFieldset>
          ))}
        </div>
      );

    case 'payment-methods':
      return (
        <div className="space-y-4">
          {paymentRails.map((rail, ix) => (
            <ConfigFieldset key={`${rail.id}-${ix}`} title={`Payment method ${ix + 1}`}>
              <ConfigFieldRow label="Gateway">
                <select className={configFld} value={coercePaymentGateway(rail.id)} onChange={(e) => patchPayment(ix, { id: coercePaymentGateway(e.target.value) })}>
                  {GATEWAYS.map((g) => (
                    <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </ConfigFieldRow>
              <ConfigFieldRow label="Checkout label">
                <input className={configFld} value={rail.label} onChange={(e) => patchPayment(ix, { label: e.target.value })} />
              </ConfigFieldRow>
              <ConfigFieldRow label="Enabled">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={rail.enabled} onChange={(e) => patchPayment(ix, { enabled: e.target.checked })} />
                  Show at checkout
                </label>
              </ConfigFieldRow>
            </ConfigFieldset>
          ))}
        </div>
      );

    case 'payment-stripe':
      return (
        <ConfigFieldset title="Stripe">
          <ConfigFieldRow label="Publishable key" comment="Client-safe pk_… key only. Never store secret keys in catalog JSON.">
            <input className={`${configFld} font-mono text-xs`} placeholder="pk_test_…" value={draft.stripePublishableKey ?? ''} onChange={(e) => setDraft((d) => ({ ...d, stripePublishableKey: e.target.value }))} />
          </ConfigFieldRow>
        </ConfigFieldset>
      );

    case 'content-header':
      return (
        <div className="space-y-6">
          <ConfigFieldset title="Header">
            <ConfigFieldRow label="Logo glyph">
              <input className={`${configFld} text-center text-2xl max-w-[120px]`} maxLength={3} value={m.headerLogoGlyph} onChange={(e) => setDraft((d) => ({ ...d, headerLogoGlyph: e.target.value }))} />
            </ConfigFieldRow>
            <ConfigFieldRow label="Tagline">
              <input className={configFld} value={m.headerTagline} onChange={(e) => setDraft((d) => ({ ...d, headerTagline: e.target.value }))} />
            </ConfigFieldRow>
          </ConfigFieldset>
          <LinkListEditor title="Main navigation" hint="Paths like /shop or full URLs. Enable Admin app for links into this panel." links={m.headerNavLinks} onChange={(headerNavLinks) => setDraft((d) => ({ ...d, headerNavLinks }))} />
        </div>
      );

    case 'content-footer':
      return (
        <div className="space-y-6">
          <ConfigFieldset title="Footer columns">
            <ConfigFieldRow label="Brand blurb">
              <textarea rows={3} className={configFld} value={m.footerBrandBlurb} onChange={(e) => setDraft((d) => ({ ...d, footerBrandBlurb: e.target.value }))} />
            </ConfigFieldRow>
            <ConfigFieldRow label="Shop column title">
              <input className={configFld} value={m.footerShopColumnTitle} onChange={(e) => setDraft((d) => ({ ...d, footerShopColumnTitle: e.target.value }))} />
            </ConfigFieldRow>
            <ConfigFieldRow label="Middle column title">
              <input className={configFld} value={m.footerMiddleColumnTitle} onChange={(e) => setDraft((d) => ({ ...d, footerMiddleColumnTitle: e.target.value }))} />
            </ConfigFieldRow>
            <ConfigFieldRow label="Contact column title">
              <input className={configFld} value={m.footerContactColumnTitle} onChange={(e) => setDraft((d) => ({ ...d, footerContactColumnTitle: e.target.value }))} />
            </ConfigFieldRow>
          </ConfigFieldset>
          <LinkListEditor title="Shop links" hint="Collection shortcuts in footer column 2." links={m.footerShopLinks} onChange={(footerShopLinks) => setDraft((d) => ({ ...d, footerShopLinks }))} />
          <LinkListEditor title="Middle column links" hint="Support or admin shortcuts." links={m.footerMiddleLinks} onChange={(footerMiddleLinks) => setDraft((d) => ({ ...d, footerMiddleLinks }))} />
          <ConfigFieldset title="Contact">
            <ConfigFieldRow label="Address">
              <input className={configFld} value={m.footerContactAddress} onChange={(e) => setDraft((d) => ({ ...d, footerContactAddress: e.target.value }))} />
            </ConfigFieldRow>
            <ConfigFieldRow label="Phone">
              <input className={configFld} value={m.footerContactPhone} onChange={(e) => setDraft((d) => ({ ...d, footerContactPhone: e.target.value }))} />
            </ConfigFieldRow>
            <ConfigFieldRow label="Email">
              <input type="email" className={configFld} value={m.footerContactEmail} onChange={(e) => setDraft((d) => ({ ...d, footerContactEmail: e.target.value }))} />
            </ConfigFieldRow>
          </ConfigFieldset>
          <ConfigFieldset title="Social profiles">
            {m.footerSocialLinks.map((s, ix) => (
              <ConfigFieldRow key={s.platform} label={s.platform}>
                <input className={`${configFld} font-mono text-xs`} placeholder="https://…" value={s.url} onChange={(e) => patchSocial(ix, { url: e.target.value })} />
              </ConfigFieldRow>
            ))}
          </ConfigFieldset>
          <LinkListEditor title="Legal links" hint="Privacy, terms, etc. beside copyright." links={m.footerLegalLinks} onChange={(footerLegalLinks) => setDraft((d) => ({ ...d, footerLegalLinks }))} />
          <button
            type="button"
            className="text-sm px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-100"
            onClick={() =>
              setDraft((d) => ({
                ...d,
                headerNavLinks: defaultHeaderNavLinks(),
                footerShopLinks: defaultFooterShopLinks(),
                footerMiddleLinks: defaultFooterMiddleLinks(),
                footerSocialLinks: defaultFooterSocialLinks(),
                footerLegalLinks: defaultFooterLegalLinks(),
              }))
            }
          >
            Reset link presets
          </button>
        </div>
      );

    default:
      return null;
  }
}
