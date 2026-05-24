import { ExternalLink, Package, ShoppingCart, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { cn } from '../ui/utils';
import type { ProductPurchaseMode } from '@boutique/shared';

type ProductTypePickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (mode: ProductPurchaseMode) => void;
};

const OPTIONS: Array<{
  mode: ProductPurchaseMode;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Package;
  accent: string;
  ring: string;
  bullets: string[];
}> = [
  {
    mode: 'internal',
    title: 'In-store product',
    subtitle: 'Your inventory',
    description: 'Full product setup with stock, SKU, images, and checkout on your gift store.',
    icon: ShoppingCart,
    accent: 'from-violet-600 to-purple-800',
    ring: 'hover:ring-violet-400 focus-visible:ring-violet-500',
    bullets: ['Cart & checkout', 'Stock tracking', 'Custom images & variants'],
  },
  {
    mode: 'affiliate',
    title: 'Affiliate product',
    subtitle: 'Partner link',
    description: 'Paste an Amazon, Flipkart, or other partner URL — we import title, image, and price for you.',
    icon: ExternalLink,
    accent: 'from-orange-500 to-rose-600',
    ring: 'hover:ring-orange-400 focus-visible:ring-orange-500',
    bullets: ['Paste link & import', 'Auto-fill from partner', 'Opens partner site to buy'],
  },
];

export function ProductTypePickerDialog({ open, onOpenChange, onSelect }: ProductTypePickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-violet-50 to-orange-50">
          <div className="flex items-center gap-2 text-violet-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Add product
          </div>
          <DialogTitle className="text-2xl">What type of product?</DialogTitle>
          <DialogDescription>
            Choose how this gift will be sold. You can manage both types in one catalog.
          </DialogDescription>
        </DialogHeader>

        <div className="grid sm:grid-cols-2 gap-4 p-6">
          {OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => {
                onSelect(opt.mode);
                onOpenChange(false);
              }}
              className={cn(
                'group text-left rounded-2xl border-2 border-gray-200 bg-white p-5 transition-all',
                'hover:border-transparent hover:shadow-xl hover:-translate-y-0.5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                opt.ring,
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center mb-4 shadow-md',
                  opt.accent,
                )}
              >
                <opt.icon className="w-6 h-6" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">
                {opt.subtitle}
              </p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{opt.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{opt.description}</p>
              <ul className="space-y-1.5">
                {opt.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-xs text-gray-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:text-violet-700">
                {opt.mode === 'affiliate' ? (
                  <>
                    <ExternalLink className="w-4 h-4" /> Import from link
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" /> Enter full details
                  </>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
