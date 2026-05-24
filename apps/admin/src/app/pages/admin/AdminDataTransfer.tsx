import { useMemo, useRef, useState } from 'react';
import {
  useStore,
  putCatalog,
  mergeStoreSettings,
  CATALOG_BACKUP_SECTIONS,
  buildCatalogBackup,
  downloadCatalogBackup,
  parseCatalogBackupFile,
  mergeCatalogImport,
  type CatalogBackupSection,
  type CatalogBackupFile,
  isAffiliateProduct,
} from '@boutique/shared';
import { Download, Upload, Database, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../components/ui/utils';

const fld =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm bg-white';

export default function AdminDataTransfer() {
  const store = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [exportSections, setExportSections] = useState<Set<CatalogBackupSection>>(
    () => new Set(CATALOG_BACKUP_SECTIONS.map((s) => s.id)),
  );
  const [importSections, setImportSections] = useState<Set<CatalogBackupSection>>(
    () => new Set(['products', 'categories']),
  );
  const [pendingBackup, setPendingBackup] = useState<CatalogBackupFile | null>(null);
  const [busy, setBusy] = useState(false);

  const catalogSnapshot = useMemo(
    () => ({
      products: store.products,
      categories: store.categories,
      customers: store.customers,
      orders: store.orders,
      reviews: store.reviews,
      coupons: store.coupons,
      settings: store.settings,
      builtPages: store.builtPages,
      affiliateReferrals: store.affiliateReferrals,
    }),
    [store],
  );

  const toggleSection = (
    set: React.Dispatch<React.SetStateAction<Set<CatalogBackupSection>>>,
    id: CatalogBackupSection,
  ) => {
    set((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onExport = () => {
    const sections = [...exportSections];
    if (sections.length === 0) {
      toast.error('Select at least one section to export.');
      return;
    }
    const backup = buildCatalogBackup(catalogSnapshot, sections);
    downloadCatalogBackup(backup);
    toast.success(`Exported ${sections.length} section(s).`);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseCatalogBackupFile(JSON.parse(text) as unknown);
      setPendingBackup(parsed);
      setImportSections(new Set(parsed.sections.filter((s) => CATALOG_BACKUP_SECTIONS.some((x) => x.id === s))));
      toast.success(`Loaded backup from ${parsed.siteName} (${parsed.exportedAt.slice(0, 10)})`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invalid backup file');
    }
  };

  const onImport = async () => {
    if (!pendingBackup) {
      toast.error('Choose a backup file first.');
      return;
    }
    const selected = [...importSections];
    if (selected.length === 0) {
      toast.error('Select sections to import.');
      return;
    }
    const destructive = selected.some((s) => ['orders', 'products', 'settings'].includes(s));
    if (
      destructive &&
      !confirm(
        `Import will replace selected sections (${selected.join(', ')}). Current data in those sections will be overwritten. Continue?`,
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const { next, result } = mergeCatalogImport(catalogSnapshot, pendingBackup, selected);
      await putCatalog(next);
      await store.reloadCatalogFromServer();
      result.warnings.forEach((w) => toast.warning(w));
      toast.success(`Imported: ${result.applied.join(', ')}`);
      setPendingBackup(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  };

  const stats = [
    { label: 'Products', value: store.products.length, sub: `${store.products.filter(isAffiliateProduct).length} affiliate` },
    { label: 'Orders', value: store.orders.length },
    { label: 'Pages', value: store.builtPages.length },
    { label: 'Customers', value: store.customers.length },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Database className="w-8 h-8 text-orange-600" />
          Import & export
        </h1>
        <p className="text-gray-600">
          Full-store backups with selectable sections — replaces the old raw products JSON export.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            {s.sub && <p className="text-[10px] text-violet-600 mt-1">{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
            <Download className="w-5 h-5 text-green-700" /> Export backup
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Downloads a versioned JSON file for {mergeStoreSettings(store.settings).siteName}.
          </p>
          <ul className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {CATALOG_BACKUP_SECTIONS.map(({ id, label, hint }) => (
              <li key={id}>
                <label className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportSections.has(id)}
                    onChange={() => toggleSection(setExportSections, id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">{label}</span>
                    <span className="block text-xs text-gray-500">{hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onExport}
            className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold hover:bg-black flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download backup
          </button>
        </section>

        <section className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
            <Upload className="w-5 h-5 text-orange-600" /> Import backup
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Restore from a backup file. Pick which sections to overwrite.
          </p>

          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-6 text-center mb-4 cursor-pointer hover:bg-orange-50/50',
              pendingBackup ? 'border-green-300 bg-green-50/30' : 'border-gray-200',
            )}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            {pendingBackup ? (
              <>
                <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="font-medium">{pendingBackup.siteName}</p>
                <p className="text-xs text-gray-500">{pendingBackup.exportedAt}</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm font-medium">Click to choose backup .json</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </div>

          {pendingBackup && (
            <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto">
              {CATALOG_BACKUP_SECTIONS.filter((s) => pendingBackup.sections.includes(s.id)).map(
                ({ id, label }) => (
                  <li key={id}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={importSections.has(id)}
                        onChange={() => toggleSection(setImportSections, id)}
                      />
                      {label}
                    </label>
                  </li>
                ),
              )}
            </ul>
          )}

          <button
            type="button"
            disabled={!pendingBackup || busy}
            onClick={() => void onImport()}
            className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {busy ? 'Importing…' : 'Import selected sections'}
          </button>

          <p className="mt-3 text-xs text-gray-500 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            Import replaces data in checked sections. Export first if unsure.
          </p>
        </section>
      </div>
    </div>
  );
}
