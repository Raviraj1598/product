import { useCallback, useMemo, useRef, useState } from 'react';
import type { HeaderLogoDesign, StoreSettings } from '@boutique/shared';
import {
  generateBadgeLogoDataUrl,
  generateWordmarkLogoDataUrl,
  hasStoreLogo,
  readImageFileAsDataUrl,
  validateLogoDataUrl,
  LOGO_UPLOAD_MAX_BYTES,
} from '@boutique/shared';
import { ImagePlus, Palette, Trash2, Type, Upload, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { configFld, ConfigFieldset } from './ConfigPrimitives';
import { cn } from '../ui/utils';

type Tab = 'upload' | 'badge' | 'wordmark' | 'text';

type Props = {
  draft: StoreSettings;
  setDraft: React.Dispatch<React.SetStateAction<StoreSettings>>;
};

function LogoPreview({ draft, className }: { draft: StoreSettings; className?: string }) {
  const hasLogo = hasStoreLogo(draft);
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 flex items-center min-h-[88px]',
        className,
      )}
    >
      {hasLogo ? (
        <div className="flex flex-col gap-1">
          <img
            src={draft.headerLogoUrl!.trim()}
            alt={draft.siteName}
            className="max-h-14 w-auto max-w-full object-contain"
          />
          {draft.headerTagline?.trim() ? (
            <p className="text-[10px] uppercase tracking-[0.2em] text-violet-700/80 font-semibold">
              {draft.headerTagline}
            </p>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="text-xl font-bold text-gray-900">{draft.siteName || 'Store name'}</p>
          <p className="text-[11px] uppercase tracking-[0.2em] text-violet-700/80 mt-1 font-semibold">
            {draft.headerTagline || 'Tagline'}
          </p>
        </div>
      )}
    </div>
  );
}

export function HeaderLogoEditor({ draft, setDraft }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const theme = draft.theme;
  const savedDesign = draft.headerLogoDesign;

  const [tab, setTab] = useState<Tab>(() => (hasStoreLogo(draft) ? 'upload' : 'badge'));
  const [design, setDesign] = useState<HeaderLogoDesign>(() => ({
    glyph: savedDesign?.glyph ?? (draft.headerLogoGlyph?.trim() || 'G'),
    primary: savedDesign?.primary ?? theme.primary,
    accent: savedDesign?.accent ?? theme.accent,
    shape: savedDesign?.shape ?? 'rounded',
    includeName: savedDesign?.includeName ?? false,
    nameText: savedDesign?.nameText ?? draft.siteName,
  }));

  const badgePreview = useMemo(
    () => generateBadgeLogoDataUrl({ ...design, siteName: draft.siteName }),
    [design, draft.siteName],
  );
  const wordmarkPreview = useMemo(
    () =>
      generateWordmarkLogoDataUrl({
        text: draft.siteName,
        primary: design.primary,
        accent: design.accent,
      }),
    [draft.siteName, design.primary, design.accent],
  );

  const applyLogoUrl = useCallback(
    (url: string, designPatch?: HeaderLogoDesign) => {
      const err = validateLogoDataUrl(url);
      if (err) {
        toast.error(err);
        return false;
      }
      setDraft((d) => ({
        ...d,
        headerLogoUrl: url,
        headerLogoDesign: designPatch,
      }));
      toast.success(
        designPatch?.includeName
          ? 'Logo saved — badge with store name will show in header & footer.'
          : 'Logo saved — image only (no separate store name text).',
      );
      return true;
    },
    [setDraft],
  );

  const clearLogo = () => {
    setDraft((d) => ({ ...d, headerLogoUrl: '', headerLogoDesign: undefined }));
    setTab('text');
    toast.success('Logo removed — storefront will show store name as text.');
  };

  const onFilePick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a PNG, JPG, WebP, or SVG image.');
      return;
    }
    if (file.size > LOGO_UPLOAD_MAX_BYTES) {
      toast.error(`Image must be under ${Math.round(LOGO_UPLOAD_MAX_BYTES / 1024)} KB.`);
      return;
    }
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      applyLogoUrl(dataUrl);
      setTab('upload');
    } catch {
      toast.error('Could not read that file.');
    }
  };

  const tabs: { id: Tab; label: string; icon: typeof Upload }[] = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'badge', label: 'Badge', icon: Palette },
    { id: 'wordmark', label: 'Wordmark', icon: Type },
    { id: 'text', label: 'Text only', icon: Wand2 },
  ];

  return (
    <ConfigFieldset title="Store logo">
      <div className="space-y-5 not-prose">
        <p className="text-sm text-gray-600 leading-relaxed">
          <strong>Logo set?</strong> Header & footer show your logo; the <strong>tagline</strong> appears
          underneath (Configuration → General → Header tagline).
          <br />
          Use <strong>Badge → Include store name</strong> to bake the store name into the logo image itself.
          <br />
          <strong>No logo?</strong> Store name + tagline appear as text.
        </p>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Live preview</p>
          <LogoPreview draft={draft} />
          {hasStoreLogo(draft) && (
            <button
              type="button"
              onClick={clearLogo}
              className="mt-3 inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" /> Remove logo (use text name)
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 -mb-px transition-colors',
                tab === id
                  ? 'border-orange-500 text-orange-700 bg-orange-50/80'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === 'upload' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-violet-200 rounded-2xl p-8 text-center bg-violet-50/40 hover:bg-violet-50/70 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                void onFilePick(e.dataTransfer.files[0]);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
            >
              <ImagePlus className="w-10 h-10 mx-auto text-violet-500 mb-3" />
              <p className="font-semibold text-gray-800">Drop logo here or click to upload</p>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, WebP, SVG · max {Math.round(LOGO_UPLOAD_MAX_BYTES / 1024)} KB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => void onFilePick(e.target.files?.[0])}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Or paste image URL</label>
              <input
                className={`${configFld} font-mono text-xs mt-2`}
                placeholder="https://…/logo.png"
                value={draft.headerLogoUrl ?? ''}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    headerLogoUrl: e.target.value,
                    headerLogoDesign: undefined,
                  }))
                }
              />
            </div>
          </div>
        )}

        {tab === 'badge' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Letter / initials</label>
                <input
                  className={`${configFld} text-center text-2xl max-w-[120px] mt-2`}
                  maxLength={2}
                  value={design.glyph}
                  onChange={(e) => setDesign((d) => ({ ...d, glyph: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Shape</label>
                <select
                  className={`${configFld} mt-2`}
                  value={design.shape}
                  onChange={(e) =>
                    setDesign((d) => ({ ...d, shape: e.target.value as HeaderLogoDesign['shape'] }))
                  }
                >
                  <option value="rounded">Rounded square</option>
                  <option value="circle">Circle</option>
                </select>
              </div>
              <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 space-y-3">
                <label className="flex items-start gap-3 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={Boolean(design.includeName)}
                    onChange={(e) =>
                      setDesign((d) => ({
                        ...d,
                        includeName: e.target.checked,
                        nameText: d.nameText?.trim() ? d.nameText : draft.siteName,
                      }))
                    }
                  />
                  <span>
                    <span className="font-semibold text-gray-900">Include store name with initial</span>
                    <span className="block text-gray-600 mt-0.5">
                      Builds a wide logo: colored badge + your store name beside it.
                    </span>
                  </span>
                </label>
                {design.includeName && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name beside badge</label>
                    <input
                      className={`${configFld} mt-2`}
                      value={design.nameText ?? draft.siteName}
                      placeholder={draft.siteName || 'GiftJoy'}
                      onChange={(e) => setDesign((d) => ({ ...d, nameText: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave as store name or type a shorter label.
                    </p>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Primary</label>
                  <input
                    type="color"
                    className="mt-2 h-10 w-full cursor-pointer rounded border"
                    value={design.primary.startsWith('#') ? design.primary.slice(0, 7) : '#6B2D8C'}
                    onChange={(e) => setDesign((d) => ({ ...d, primary: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Accent</label>
                  <input
                    type="color"
                    className="mt-2 h-10 w-full cursor-pointer rounded border"
                    value={design.accent.startsWith('#') ? design.accent.slice(0, 7) : '#E8725C'}
                    onChange={(e) => setDesign((d) => ({ ...d, accent: e.target.value }))}
                  />
                </div>
              </div>
              <button
                type="button"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 text-white font-semibold hover:opacity-95"
                onClick={() => {
                  if (design.includeName && !(design.nameText?.trim() || draft.siteName.trim())) {
                    toast.error('Set store name first (General → Store Information) or type a name.');
                    return;
                  }
                  const url = generateBadgeLogoDataUrl({ ...design, siteName: draft.siteName });
                  if (url) {
                    setDraft((d) => ({ ...d, headerLogoGlyph: design.glyph }));
                    applyLogoUrl(url, design);
                  }
                }}
              >
                {design.includeName ? 'Use badge + name as logo' : 'Use badge only as logo'}
              </button>
            </div>
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-gray-50 p-8 min-h-[180px]">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-4">Preview</p>
              {badgePreview ? (
                <img
                  src={badgePreview}
                  alt=""
                  className={cn(
                    'object-contain drop-shadow-lg',
                    design.includeName ? 'max-h-16 w-full max-w-md' : 'w-32 h-32',
                  )}
                />
              ) : null}
            </div>
          </div>
        )}

        {tab === 'wordmark' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Creates a wide text logo from your store name:{' '}
              <strong>{draft.siteName || '(set store name in General)'}</strong>
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              <div>
                <label className="text-sm font-medium text-gray-700">Primary</label>
                <input
                  type="color"
                  className="mt-2 h-10 w-full cursor-pointer rounded border"
                  value={design.primary.startsWith('#') ? design.primary.slice(0, 7) : '#6B2D8C'}
                  onChange={(e) => setDesign((d) => ({ ...d, primary: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Accent</label>
                <input
                  type="color"
                  className="mt-2 h-10 w-full cursor-pointer rounded border"
                  value={design.accent.startsWith('#') ? design.accent.slice(0, 7) : '#E8725C'}
                  onChange={(e) => setDesign((d) => ({ ...d, accent: e.target.value }))}
                />
              </div>
            </div>
            <div className="rounded-2xl border bg-gray-50 p-6 flex items-center justify-center min-h-[100px]">
              {wordmarkPreview ? (
                <img src={wordmarkPreview} alt="" className="max-h-16 w-full max-w-md object-contain" />
              ) : null}
            </div>
            <button
              type="button"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-rose-600 text-white font-semibold hover:opacity-95"
              onClick={() => {
                if (!draft.siteName.trim()) {
                  toast.error('Set store name first (General → Store Information).');
                  return;
                }
                const url = generateWordmarkLogoDataUrl({
                  text: draft.siteName,
                  primary: design.primary,
                  accent: design.accent,
                });
                if (url) applyLogoUrl(url, { ...design, glyph: draft.siteName.slice(0, 1) });
              }}
            >
              Use wordmark as logo
            </button>
          </div>
        )}

        {tab === 'text' && (
          <div className="rounded-xl bg-gray-50 border p-5 space-y-3 text-sm text-gray-700">
            <p>
              No logo image — the storefront shows <strong>{draft.siteName || 'store name'}</strong> and tagline
              as styled text in the header and footer.
            </p>
            <button
              type="button"
              onClick={clearLogo}
              className="px-4 py-2 border rounded-lg hover:bg-white font-medium"
            >
              Switch to text-only branding
            </button>
          </div>
        )}
      </div>
    </ConfigFieldset>
  );
}
