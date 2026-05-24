import type { AdminPanelSettings } from '../types';

export function defaultAdminPanelSettings(): AdminPanelSettings {
  return {
    panelTitle: 'GiftJoy Admin',
    panelSubtitle: 'Store management',
    accentColor: '#f97316',
    defaultProductMode: 'picker',
    showStorefrontLink: true,
    supportEmail: 'admin@giftjoy.store',
    dashboardNote: 'Manage products, affiliate picks, orders, and storefront settings from here.',
    orderNotifyEnabled: false,
    orderNotifyEmail: '',
    orderNotifyHelpNote: '',
  };
}
