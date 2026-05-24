import { useEffect, useState } from 'react';
import type { StoreSettings } from '@boutique/shared';
import { mergeStoreSettings, useStore } from '@boutique/shared';
import { Save, Shield } from 'lucide-react';
import { toast } from 'sonner';
import {
  AdminNotificationsConfigSection,
  AdminPanelConfigSection,
  AdminSecurityConfigSection,
} from '../../components/configuration/AdminConfigPanels';

type AdminTab = 'panel' | 'notifications' | 'security';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'panel', label: 'Panel & workflow' },
  { id: 'notifications', label: 'Order alerts' },
  { id: 'security', label: 'Security & login' },
];

export default function AdminSettings() {
  const { settings, setSettings } = useStore();
  const [draft, setDraft] = useState<StoreSettings>(() => mergeStoreSettings(settings));
  const [tab, setTab] = useState<AdminTab>('panel');

  useEffect(() => {
    setDraft(mergeStoreSettings(settings));
  }, [settings]);

  const save = () => {
    setSettings(draft);
    toast.success('Admin settings saved');
  };

  return (
    <div className="min-h-full flex flex-col bg-[#f8f8f8]">
      <header className="bg-gray-900 text-white shrink-0 sticky top-0 z-20">
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-orange-400" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">System</p>
              <h1 className="text-lg font-semibold tracking-tight">Admin settings</h1>
            </div>
          </div>
          {tab !== 'security' && (
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-2 shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-sm text-sm font-semibold shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-56 shrink-0 bg-white border-r border-gray-300 overflow-y-auto">
          <ul className="p-2">
            {TABS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`w-full text-left text-sm px-4 py-2.5 border-l-[3px] transition-colors ${
                    tab === item.id
                      ? 'border-orange-500 bg-orange-50 text-orange-900 font-medium'
                      : 'border-transparent text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {TABS.find((t) => t.id === tab)?.label}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {tab === 'security'
                ? 'Password and session actions apply immediately.'
                : 'These settings affect the admin panel only — not the storefront.'}
            </p>
          </div>

          {tab === 'panel' && <AdminPanelConfigSection draft={draft} setDraft={setDraft} />}
          {tab === 'notifications' && (
            <AdminNotificationsConfigSection draft={draft} setDraft={setDraft} />
          )}
          {tab === 'security' && <AdminSecurityConfigSection />}
        </div>
      </div>
    </div>
  );
}
