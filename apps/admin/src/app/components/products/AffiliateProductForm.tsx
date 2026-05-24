import { useMemo, useState } from 'react';

import {

  ExternalLink,

  Loader2,

  Sparkles,

  ChevronDown,

  ChevronUp,

  ImagePlus,

  DollarSign,

} from 'lucide-react';

import {

  formatProductPrice,

  resolveCategorySlug,

  sortedAffiliatePlatforms,

  type AffiliatePlatformConfig,

  type ProductPurchaseMode,

} from '@boutique/shared';

import { cn } from '../ui/utils';
import { ImageUrlOrUploadField } from '../ImageUrlOrUploadField';



export type AffiliateFormData = {

  name: string;

  description: string;

  price: string;

  compareAtPrice: string;

  images: string[];

  category: string;

  tags: string;

  featured: boolean;

  purchaseMode: ProductPurchaseMode;

  affiliateUrl: string;

  affiliateVendor: string;

  affiliateButtonLabel: string;

  affiliatePlatformId: string;

  priceCurrency: string;

  rating: string;

  reviewCount: string;

};



type CategoryRow = { id: string; name: string; published?: boolean; sortOrder?: number };



type AffiliateProductFormProps = {

  formData: AffiliateFormData;

  setFormData: React.Dispatch<React.SetStateAction<AffiliateFormData>>;

  sortedCategories: CategoryRow[];

  affiliatePlatforms: AffiliatePlatformConfig[];

  fetching: boolean;

  imported: boolean;

  onImport: () => void;

  fld: string;

};



function applyPlatformDefaults(

  platform: AffiliatePlatformConfig,

  prev: AffiliateFormData,

): Partial<AffiliateFormData> {

  return {

    affiliatePlatformId: platform.id,

    affiliateVendor: platform.name,

    affiliateButtonLabel: prev.affiliateButtonLabel.trim() || platform.buttonLabel,

    priceCurrency: platform.currency || prev.priceCurrency,

  };

}



export function AffiliateProductForm({

  formData,

  setFormData,

  sortedCategories,

  affiliatePlatforms,

  fetching,

  imported,

  onImport,

  fld,

}: AffiliateProductFormProps) {

  const [showEdits, setShowEdits] = useState(false);

  const platforms = useMemo(

    () => sortedAffiliatePlatforms(affiliatePlatforms),

    [affiliatePlatforms],

  );

  const selectedPlatform =

    platforms.find((p) => p.id === formData.affiliatePlatformId) ?? platforms[0];



  const primaryThumb =

    formData.images.map((x) => x.trim()).find(Boolean) ||

    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop';



  const selectedCatMeta = sortedCategories.find((c) => c.name === formData.category) ?? null;

  const categoryHint = selectedCatMeta

    ? `Storefront chip: ${resolveCategorySlug(selectedCatMeta)}`

    : 'Assign a storefront category';



  const displayPrice =

    formData.price && Number.isFinite(Number(formData.price))

      ? formatProductPrice(Number(formData.price), formData.priceCurrency || selectedPlatform?.currency)

      : null;



  const importHint = selectedPlatform?.importEnabled

    ? `Import works for ${selectedPlatform.name} product URLs.`

    : 'URL import is manual for this platform — paste the link and fill details below.';



  return (

    <div className="space-y-5">

      <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-violet-50 p-5">

        <div className="flex items-center gap-2 text-orange-800 text-xs font-semibold uppercase tracking-wide mb-3">

          <Sparkles className="w-4 h-4" />

          Step 1 · Choose platform & paste link

        </div>



        <label className="text-sm font-semibold text-gray-800">Affiliate platform</label>

        <select

          required

          className={cn(fld, 'mt-2')}

          value={formData.affiliatePlatformId || selectedPlatform?.id || ''}

          onChange={(e) => {

            const platform = platforms.find((p) => p.id === e.target.value);

            if (!platform) return;

            setFormData((f) => ({ ...f, ...applyPlatformDefaults(platform, f) }));

          }}

        >

          {platforms.length === 0 ? (

            <option value="">— Add platforms in Settings —</option>

          ) : (

            platforms.map((p) => (

              <option key={p.id} value={p.id}>

                {p.name}

                {!p.importEnabled ? ' (manual)' : ''}

              </option>

            ))

          )}

        </select>

        <p className="text-[11px] text-gray-500 mt-1">

          Manage platforms in <strong>Settings → Catalog → Affiliate Platforms</strong>.

        </p>



        <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mt-4">

          <ExternalLink className="w-4 h-4 opacity-70" />

          Product URL

        </label>

        <input

          type="url"

          required

          className={cn(fld, 'mt-2 font-mono text-xs')}

          placeholder="https://www.amazon.in/dp/B0D8TMGYRQ"

          value={formData.affiliateUrl}

          onChange={(e) => setFormData((f) => ({ ...f, affiliateUrl: e.target.value }))}

        />

        {selectedPlatform?.domainPattern.includes('amazon') && (

          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-[11px] text-amber-950 leading-relaxed space-y-1">

            <p className="font-semibold">Use a product page link — not the Amazon homepage</p>

            <p>

              URL must contain <code className="bg-amber-100 px-1 rounded">/dp/</code> and the 10-character

              ASIN.

            </p>

            <p className="font-mono text-[10px] break-all text-amber-900">

              ✓ https://www.amazon.in/dp/B0D8TMGYRQ (tag from platform settings)

            </p>

          </div>

        )}

        <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">{importHint}</p>

        <button

          type="button"

          disabled={fetching || !formData.affiliateUrl.trim()}

          onClick={onImport}

          className="mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-600 text-white py-3 rounded-xl font-semibold hover:opacity-95 disabled:opacity-50 transition-opacity"

        >

          {fetching ? (

            <>

              <Loader2 className="w-4 h-4 animate-spin" />

              Importing from partner…

            </>

          ) : (

            <>

              <ExternalLink className="w-4 h-4" />

              Import product details

            </>

          )}

        </button>

      </div>



      {(imported || formData.name.trim()) && (

        <div className="rounded-2xl border bg-white p-4 shadow-sm">

          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 mb-3">

            Step 2 · Preview

          </p>

          <div className="flex gap-4">

            <img

              src={primaryThumb}

              alt=""

              className="w-24 h-24 rounded-xl object-cover border bg-gray-100 shrink-0"

            />

            <div className="min-w-0 flex-1">

              <h4 className="font-semibold text-gray-900 line-clamp-2">

                {formData.name || 'Product name will appear after import'}

              </h4>

              {(formData.affiliateVendor || selectedPlatform?.name) && (

                <p className="text-xs text-violet-700 font-medium mt-1">

                  via {formData.affiliateVendor || selectedPlatform?.name}

                </p>

              )}

              {displayPrice && <p className="text-lg font-bold text-gray-900 mt-2">{displayPrice}</p>}

              {formData.rating && Number(formData.rating) > 0 && (

                <p className="text-xs text-amber-700 mt-1">

                  Partner rating: {Number(formData.rating).toFixed(1)}

                  {formData.reviewCount ? ` (${formData.reviewCount} reviews)` : ''}

                </p>

              )}

              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{formData.description}</p>

            </div>

          </div>

        </div>

      )}



      <div className="space-y-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Step 3 · Publish</p>

        <div>

          <label className="text-sm font-semibold text-gray-800">Category</label>

          <select

            required

            className={cn(fld, 'mt-2')}

            value={formData.category}

            onChange={(e) => setFormData((f) => ({ ...f, category: e.target.value }))}

          >

            {sortedCategories.length === 0 ? (

              <option value="">— Add a category first —</option>

            ) : (

              sortedCategories.map((cat) => (

                <option key={cat.id} value={cat.name}>

                  {cat.name}

                  {cat.published === false ? ' (hidden)' : ''}

                </option>

              ))

            )}

          </select>

          <p className="text-[11px] text-gray-500 mt-2 font-mono">{categoryHint}</p>

        </div>



        <label className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer hover:bg-gray-50/80">

          <input

            type="checkbox"

            checked={formData.featured}

            onChange={(e) => setFormData((f) => ({ ...f, featured: e.target.checked }))}

            className="mt-1 w-4 h-4 rounded"

          />

          <span>

            <span className="font-semibold text-sm block">Featured on homepage</span>

            <span className="text-xs text-gray-600">Show this partner pick in trending sections.</span>

          </span>

        </label>

      </div>



      <div className="border rounded-xl overflow-hidden">

        <button

          type="button"

          onClick={() => setShowEdits((v) => !v)}

          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100"

        >

          Adjust imported details (optional)

          {showEdits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}

        </button>

        {showEdits && (

          <div className="p-4 space-y-4 border-t">

            <div>

              <label className="text-sm font-semibold text-gray-800">Product name</label>

              <input

                className={cn(fld, 'mt-2')}

                value={formData.name}

                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}

              />

            </div>

            <div>

              <label className="text-sm font-semibold text-gray-800">Description</label>

              <textarea

                rows={4}

                className={cn(fld, 'mt-2')}

                value={formData.description}

                onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}

              />

            </div>

            <div className="grid grid-cols-2 gap-3">

              <div>

                <label className="flex items-center gap-1 text-sm font-semibold text-gray-800">

                  <DollarSign className="w-4 h-4" /> Price

                </label>

                <input

                  type="number"

                  step={0.01}

                  min={0}

                  className={cn(fld, 'mt-2')}

                  placeholder="Display price"

                  value={formData.price}

                  onChange={(e) => setFormData((f) => ({ ...f, price: e.target.value }))}

                />

              </div>

              <div>

                <label className="text-sm font-semibold text-gray-800">Currency</label>

                <select

                  className={cn(fld, 'mt-2')}

                  value={formData.priceCurrency}

                  onChange={(e) => setFormData((f) => ({ ...f, priceCurrency: e.target.value }))}

                >

                  {['INR', 'USD', 'EUR', 'GBP'].map((c) => (

                    <option key={c} value={c}>

                      {c}

                    </option>

                  ))}

                </select>

              </div>

            </div>

            <div>

              <label className="text-sm font-semibold text-gray-800">Compare-at</label>

              <input

                type="number"

                step={0.01}

                min={0}

                className={cn(fld, 'mt-2')}

                value={formData.compareAtPrice}

                onChange={(e) => setFormData((f) => ({ ...f, compareAtPrice: e.target.value }))}

              />

            </div>

            <div>

              <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">

                <ImagePlus className="w-4 h-4" /> Product image

              </label>

              <ImageUrlOrUploadField

                value={formData.images[0] ?? ''}

                onChange={(v) => setFormData((f) => ({ ...f, images: [v] }))}

                inputClassName={cn(fld, 'font-mono text-xs')}

              />

            </div>

            <div>

              <label className="text-sm font-semibold text-gray-800">Partner name</label>

              <input

                className={cn(fld, 'mt-2')}

                value={formData.affiliateVendor}

                onChange={(e) => setFormData((f) => ({ ...f, affiliateVendor: e.target.value }))}

              />

            </div>

            <div>

              <label className="text-sm font-semibold text-gray-800">Button label</label>

              <input

                className={cn(fld, 'mt-2')}

                placeholder='e.g. "Buy on Amazon"'

                value={formData.affiliateButtonLabel}

                onChange={(e) => setFormData((f) => ({ ...f, affiliateButtonLabel: e.target.value }))}

              />

            </div>

          </div>

        )}

      </div>

    </div>

  );

}



