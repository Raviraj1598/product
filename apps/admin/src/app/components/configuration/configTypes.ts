import type { LucideIcon } from 'lucide-react';
import {
  CreditCard,
  LayoutTemplate,
  Package,
  Palette,
  Settings2,
  Store,
  Truck,
} from 'lucide-react';

/** Magento-style configuration section id (URL: ?section=…) */
export type ConfigSectionId =
  | 'general-store'
  | 'general-homepage'
  | 'design-theme'
  | 'design-web'
  | 'sales-tax'
  | 'sales-checkout'
  | 'catalog-policies'
  | 'shipping-settings'
  | 'shipping-methods'
  | 'payment-methods'
  | 'payment-stripe'
  | 'content-header'
  | 'content-footer';

export type ConfigNavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: { id: ConfigSectionId; label: string }[];
};

export const CONFIG_NAV: ConfigNavGroup[] = [
  {
    id: 'general',
    label: 'General',
    icon: Store,
    items: [
      { id: 'general-store', label: 'Store Information' },
      { id: 'general-homepage', label: 'Homepage Content' },
    ],
  },
  {
    id: 'design',
    label: 'Design',
    icon: Palette,
    items: [
      { id: 'design-theme', label: 'Theme & Colors' },
      { id: 'design-web', label: 'Web & Announcement' },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    icon: Package,
    items: [{ id: 'catalog-policies', label: 'Product Policies' }],
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: Settings2,
    items: [
      { id: 'sales-tax', label: 'Tax' },
      { id: 'sales-checkout', label: 'Checkout & Totals' },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping',
    icon: Truck,
    items: [
      { id: 'shipping-settings', label: 'Shipping Settings' },
      { id: 'shipping-methods', label: 'Delivery Methods' },
    ],
  },
  {
    id: 'payment',
    label: 'Payment',
    icon: CreditCard,
    items: [
      { id: 'payment-methods', label: 'Payment Methods' },
      { id: 'payment-stripe', label: 'Stripe Integration' },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: LayoutTemplate,
    items: [
      { id: 'content-header', label: 'Header' },
      { id: 'content-footer', label: 'Footer' },
    ],
  },
];

export const DEFAULT_CONFIG_SECTION: ConfigSectionId = 'general-store';

export function isConfigSectionId(v: string | null): v is ConfigSectionId {
  if (!v) return false;
  return CONFIG_NAV.some((g) => g.items.some((i) => i.id === v));
}

export function sectionMeta(id: ConfigSectionId): { group: string; label: string } {
  for (const g of CONFIG_NAV) {
    const item = g.items.find((i) => i.id === id);
    if (item) return { group: g.label, label: item.label };
  }
  return { group: 'Configuration', label: 'Settings' };
}
