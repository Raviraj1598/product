import { useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { Save } from 'lucide-react';
import {
  CONFIG_NAV,
  DEFAULT_CONFIG_SECTION,
  firstSectionInGroup,
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
    () => ['Stores', 'Configuration', meta.group, meta.label] as const,
    [meta.group, meta.label],
  );

  const onBreadcrumbClick = (index: number) => {
    if (index === 1) {
      setSection(DEFAULT_CONFIG_SECTION);
      return;
    }
    if (index === 2) {
      const first = firstSectionInGroup(meta.group);
      if (first) setSection(first);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#f8f8f8]">
      <header className="bg-[#514943] text-white shrink-0 sticky top-0 z-20">
        <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-orange-200/90 font-semibold">System</p>
            <h1 className="text-lg font-semibold tracking-tight">Configuration</h1>
          </div>
        </div>
        <nav className="px-6 pb-2 flex flex-wrap gap-1 text-xs text-orange-100/80" aria-label="Breadcrumb">
          {breadcrumb.map((crumb, i) => {
            const isLast = i === breadcrumb.length - 1;
            const isClickable = !isLast && (i === 1 || i === 2);
            return (
              <span key={`${crumb}-${i}`} className="flex items-center gap-1">
                {i > 0 ? <span className="opacity-50">›</span> : null}
                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => onBreadcrumbClick(i)}
                    className="hover:text-white underline-offset-2 hover:underline"
                  >
                    {crumb}
                  </button>
                ) : (
                  <span className={isLast ? 'text-white font-medium' : ''}>{crumb}</span>
                )}
              </span>
            );
          })}
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
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-semibold text-gray-900">{meta.label}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {meta.group} configuration — changes sync to the storefront after you save.
                </p>
              </div>
              <button
                type="button"
                onClick={onSave}
                className="inline-flex items-center gap-2 shrink-0 bg-[#eb5202] hover:bg-[#d04a02] text-white px-5 py-2.5 rounded-sm text-sm font-semibold shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Config
              </button>
            </div>
            {children(active)}
          </div>
        </div>
      </div>
    </div>
  );
}
