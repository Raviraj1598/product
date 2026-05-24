import type { StoreSettings } from '../types';

import { mergeStoreSettings } from '../catalog/storeSettings';



/** True when a logo image URL is set (uploaded or generated). */

export function hasStoreLogo(settings?: Partial<StoreSettings> | null): boolean {

  return Boolean(mergeStoreSettings(settings).headerLogoUrl?.trim());

}



export type LogoBadgeShape = HeaderLogoDesign['shape'];



export type { HeaderLogoDesign };



const FONT_STACK = 'system-ui, -apple-system, Segoe UI, sans-serif';



function roundRect(

  ctx: CanvasRenderingContext2D,

  x: number,

  y: number,

  w: number,

  h: number,

  r: number,

) {

  const radius = Math.min(r, w / 2, h / 2);

  ctx.beginPath();

  ctx.moveTo(x + radius, y);

  ctx.arcTo(x + w, y, x + w, y + h, radius);

  ctx.arcTo(x + w, y + h, x, y + h, radius);

  ctx.arcTo(x, y + h, x, y, radius);

  ctx.arcTo(x, y, x + w, y, radius);

  ctx.closePath();

}



function drawBadge(

  ctx: CanvasRenderingContext2D,

  opts: Pick<HeaderLogoDesign, 'glyph' | 'primary' | 'accent' | 'shape'>,

  x: number,

  y: number,

  size: number,

) {

  const pad = size * 0.06;

  const grad = ctx.createLinearGradient(x, y, x + size, y + size);

  grad.addColorStop(0, opts.primary);

  grad.addColorStop(0.55, opts.accent);

  grad.addColorStop(1, opts.primary);



  if (opts.shape === 'circle') {

    ctx.beginPath();

    ctx.arc(x + size / 2, y + size / 2, size / 2 - pad, 0, Math.PI * 2);

    ctx.fillStyle = grad;

    ctx.fill();

  } else {

    roundRect(ctx, x + pad, y + pad, size - pad * 2, size - pad * 2, size * 0.22);

    ctx.fillStyle = grad;

    ctx.fill();

  }



  const glyph = (opts.glyph.trim() || 'G').slice(0, 2).toUpperCase();

  ctx.fillStyle = '#ffffff';

  ctx.font = `700 ${Math.round(size * 0.42)}px ${FONT_STACK}`;

  ctx.textAlign = 'center';

  ctx.textBaseline = 'middle';

  ctx.fillText(glyph, x + size / 2, y + size / 2 + size * 0.02);

}



function resolvedNameText(opts: HeaderLogoDesign & { siteName?: string }): string {

  return (opts.nameText?.trim() || opts.siteName?.trim() || 'Store').slice(0, 48);

}



function shouldIncludeName(opts: HeaderLogoDesign & { siteName?: string }): boolean {

  return Boolean(opts.includeName && resolvedNameText(opts));

}



/** Generate a square badge logo PNG as a data URL (browser only). */

export function generateBadgeLogoDataUrl(

  opts: HeaderLogoDesign & { size?: number; siteName?: string },

): string {

  if (typeof document === 'undefined') return '';



  if (shouldIncludeName(opts)) {

    return generateBadgeWithNameLogoDataUrl({

      ...opts,

      text: resolvedNameText(opts),

    });

  }



  const size = opts.size ?? 256;

  const canvas = document.createElement('canvas');

  canvas.width = size;

  canvas.height = size;

  const ctx = canvas.getContext('2d');

  if (!ctx) return '';



  drawBadge(ctx, opts, 0, 0, size);

  return canvas.toDataURL('image/png');

}



/** Horizontal mark: colored badge initial + store name text. */

export function generateBadgeWithNameLogoDataUrl(

  opts: HeaderLogoDesign & { text: string; height?: number },

): string {

  if (typeof document === 'undefined') return '';

  const text = opts.text.trim() || 'Store';

  const height = opts.height ?? 128;

  const badgeSize = Math.round(height * 0.88);

  const gap = Math.round(height * 0.14);

  const sidePad = Math.round(height * 0.06);



  const probe = document.createElement('canvas').getContext('2d');

  if (!probe) return '';



  const fontSize = Math.min(Math.round(height * 0.44), Math.floor((height * 2.2) / Math.max(text.length, 1)));

  probe.font = `700 ${fontSize}px ${FONT_STACK}`;

  const textWidth = probe.measureText(text).width;



  const width = Math.ceil(sidePad + badgeSize + gap + textWidth + sidePad);

  const canvas = document.createElement('canvas');

  canvas.width = width;

  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) return '';



  const badgeY = (height - badgeSize) / 2;

  drawBadge(ctx, opts, sidePad, badgeY, badgeSize);



  const grad = ctx.createLinearGradient(0, 0, width, 0);

  grad.addColorStop(0, opts.primary);

  grad.addColorStop(0.5, opts.accent);

  grad.addColorStop(1, opts.primary);

  ctx.fillStyle = grad;

  ctx.font = `700 ${fontSize}px ${FONT_STACK}`;

  ctx.textAlign = 'left';

  ctx.textBaseline = 'middle';

  ctx.fillText(text, sidePad + badgeSize + gap, height / 2 + 1);



  return canvas.toDataURL('image/png');

}



/** Generate a horizontal wordmark logo from the store name. */

export function generateWordmarkLogoDataUrl(opts: {

  text: string;

  primary: string;

  accent: string;

  width?: number;

  height?: number;

}): string {

  if (typeof document === 'undefined') return '';

  const text = opts.text.trim() || 'Store';

  const width = opts.width ?? 480;

  const height = opts.height ?? 120;

  const canvas = document.createElement('canvas');

  canvas.width = width;

  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) return '';



  ctx.clearRect(0, 0, width, height);



  const fontSize = Math.min(56, Math.floor((width / text.length) * 1.35));

  ctx.font = `700 ${fontSize}px ${FONT_STACK}`;

  ctx.textAlign = 'left';

  ctx.textBaseline = 'middle';



  const grad = ctx.createLinearGradient(0, 0, width, 0);

  grad.addColorStop(0, opts.primary);

  grad.addColorStop(0.5, opts.accent);

  grad.addColorStop(1, opts.primary);

  ctx.fillStyle = grad;

  ctx.fillText(text, 0, height / 2 + 2);



  return canvas.toDataURL('image/png');

}



/** Read an image file as a data URL (browser only). */

export function readImageFileAsDataUrl(file: File): Promise<string> {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = () => {

      if (typeof reader.result === 'string') resolve(reader.result);

      else reject(new Error('Could not read file'));

    };

    reader.onerror = () => reject(new Error('Could not read file'));

    reader.readAsDataURL(file);

  });

}



export const LOGO_UPLOAD_MAX_BYTES = 512 * 1024;



export function validateLogoDataUrl(dataUrl: string): string | null {

  if (!dataUrl.startsWith('data:image/')) {

    return 'Logo must be a PNG, JPG, WebP, or SVG image.';

  }

  const approxBytes = Math.ceil((dataUrl.length * 3) / 4);

  if (approxBytes > LOGO_UPLOAD_MAX_BYTES) {

    return `Logo is too large (max ${Math.round(LOGO_UPLOAD_MAX_BYTES / 1024)} KB). Use a smaller image or the built-in designer.`;

  }

  return null;

}

