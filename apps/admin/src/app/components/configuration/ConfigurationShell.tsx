import { useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { Save } from 'lucide-react';
import {
  CONFIG_NAV,
  DEFAULT_CONFIG_SECTION,
  isConfigSectionId,
  sectionMeta,
  type ConfigSectionId,
} from './configTypes';

export function ConfigurationShell({
  onSave,
  children,
}: {
  onSave: () => void;
  children: (section: ConfigSectionId) => ReactNode;
}) {
  const [params, setParams] = useSearchParams();
  const raw = params.get('section');
  const active: ConfigSectionId = isConfigSectionId(raw) ? raw : DEFAULT_CONFIG_SECTION;
  const meta = sectionMeta(active);

  const setSection = (id: ConfigSectionId) => {
    setParams({ section: id }, { replace: true });
  };

  const breadcrumb = useMemo(
    () => ['Stores', 'Configuration', meta.group, meta.label],
    [meta.group, meta.label],
  );

  return (
    <div className="min-h-full flex flex-col bg-[#f8f8f8]">
      <header className="bg-[#514943] text-white shrink-0">
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-orange-200/90 font-semibold">System</p>
            <h1 className="text-lg font-semibold tracking-tight">Configuration</h1>
          </div>
          <div className="flex items-center gap-2 text-xs bg-black/20 rounded px-3 py-1.5 border border-white/10">
            <span className="text-gray-300">Scope:</span>
            <span className="font-medium">Default Store View</span>
          </div>
        </div>
        <nav className="px-6 pb-2 flex flex-wrap gap-1 text-xs text-orange-100/80" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <span key={`${crumb}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <span className="opacity-50">›</span> : null}
              <span className={i === breadcrumb.length - 1 ? 'text-white font-medium' : ''}>{crumb}</span>
            </span>
          ))}
        </nav>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-64 shrink-0 bg-white border-r border-gray-300 overflow-y-auto">
          <div className="p-2">
            {CONFIG_NAV.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id} className="mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                    <Icon className="w-3.5 h-3.5" />
                    {group.label}
                  </div>
                  <ul>
                    {group.items.map((item) => {
                      const isActive = item.id === active;
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => setSection(item.id)}
                            className={`w-full text-left text-sm px-4 py-2 border-l-[3px] transition-colors ${
                              isActive
                                ? 'border-orange-600 bg-orange-50 text-orange-900 font-medium'
                                : 'border-transparent text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{meta.label}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {meta.group} configuration — changes sync to the storefront after you save.
              </p>
            </div>
            {children(active)}
          </div>

          <div className="shrink-0 border-t border-gray-300 bg-white px-6 py-4 flex items-center gap-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-2 bg-[#eb5202] hover:bg-[#d04a02] text-white px-5 py-2.5 rounded-sm text-sm font-semibold shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Config
            </button>
            <span className="text-xs text-gray-500">
              Persists to catalog SQLite · visible on next storefront load
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
