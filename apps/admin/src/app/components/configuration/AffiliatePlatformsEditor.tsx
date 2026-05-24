import type { AffiliatePlatformConfig } from '@boutique/shared';
import { defaultAffiliatePlatforms } from '@boutique/shared';
import { Plus, Trash2 } from 'lucide-react';
import { configFld, ConfigFieldRow, ConfigFieldset } from './ConfigPrimitives';

type Props = {
  platforms: AffiliatePlatformConfig[];
  onChange: (platforms: AffiliatePlatformConfig[]) => void;
};

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

function emptyPlatform(sortOrder: number): AffiliatePlatformConfig {
  return {
    id: `platform-${crypto.randomUUID().slice(0, 8)}`,
    name: 'New partner',
    domainPattern: '',
    affiliateParamName: '',
    affiliateParamValue: '',
    buttonLabel: 'Shop now',
    currency: 'INR',
    importEnabled: false,
    enabled: true,
    sortOrder,
  };
}

export function AffiliatePlatformsEditor({ platforms, onChange }: Props) {
  const rows = platforms.length ? platforms : defaultAffiliatePlatforms();

  const patch = (ix: number, patch: Partial<AffiliatePlatformConfig>) => {
    const next = [...rows];
    next[ix] = { ...next[ix], ...patch };
    onChange(next);
  };

  const add = () => onChange([...rows, emptyPlatform(rows.length)]);

  const remove = (ix: number) => {
    const next = rows.filter((_, i) => i !== ix);
    onChange(next.length ? next : defaultAffiliatePlatforms());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600 max-w-2xl">
          Configure affiliate partners once here. When adding a product, pick a platform from the dropdown —
          button label, currency, and tracking params apply automatically.
        </p>
        <button
          type="button"
          onClick={add}
          className="text-sm px-4 py-2 border border-gray-300 rounded-sm inline-flex items-center gap-2 hover:bg-gray-900 hover:text-white shrink-0"
        >
          <Plus className="w-4 h-4" /> Add platform
        </button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm min-w-[960px]">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-3 py-2 font-semibold">Platform</th>
              <th className="px-3 py-2 font-semibold">Domain match</th>
              <th className="px-3 py-2 font-semibold">Affiliate param</th>
              <th className="px-3 py-2 font-semibold">Param value</th>
              <th className="px-3 py-2 font-semibold">Button label</th>
              <th className="px-3 py-2 font-semibold">Currency</th>
              <th className="px-3 py-2 font-semibold">Import</th>
              <th className="px-3 py-2 font-semibold">On</th>
              <th className="px-3 py-2 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, ix) => (
              <tr key={row.id} className="align-top hover:bg-gray-50/50">
                <td className="px-3 py-2">
                  <input
                    className={`${configFld} text-xs`}
                    value={row.name}
                    onChange={(e) => patch(ix, { name: e.target.value })}
                    placeholder="Amazon India"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className={`${configFld} font-mono text-xs`}
                    value={row.domainPattern}
                    onChange={(e) => patch(ix, { domainPattern: e.target.value })}
                    placeholder="amazon.in"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className={`${configFld} font-mono text-xs`}
                    value={row.affiliateParamName}
                    onChange={(e) => patch(ix, { affiliateParamName: e.target.value })}
                    placeholder="tag"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className={`${configFld} font-mono text-xs`}
                    value={row.affiliateParamValue}
                    onChange={(e) => patch(ix, { affiliateParamValue: e.target.value })}
                    placeholder="your-tag-21"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className={`${configFld} text-xs`}
                    value={row.buttonLabel}
                    onChange={(e) => patch(ix, { buttonLabel: e.target.value })}
                    placeholder="Buy on Amazon"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    className={`${configFld} text-xs`}
                    value={row.currency}
                    onChange={(e) => patch(ix, { currency: e.target.value })}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.importEnabled}
                    onChange={(e) => patch(ix, { importEnabled: e.target.checked })}
                    title="Allow URL import for this platform"
                  />
                </td>
                <td className="px-3 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => patch(ix, { enabled: e.target.checked })}
                    title="Show in product dropdown"
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    className="text-red-600 p-1 hover:bg-red-50 rounded"
                    onClick={() => remove(ix)}
                    title="Remove platform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfigFieldset title="How it works" defaultOpen={false}>
        <ConfigFieldRow label="Domain match" comment="Used to auto-detect platform when you paste a product URL.">
          <span className="text-sm text-gray-600">e.g. amazon.in matches www.amazon.in/dp/…</span>
        </ConfigFieldRow>
        <ConfigFieldRow label="Affiliate param" comment="Query parameter appended to outbound links (tag, affid, utm_source, …).">
          <span className="text-sm text-gray-600">Amazon uses tag=aaravitech-21</span>
        </ConfigFieldRow>
      </ConfigFieldset>
    </div>
  );
}
