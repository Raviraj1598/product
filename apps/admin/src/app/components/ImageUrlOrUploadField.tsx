import { useId, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { readImageFileAsDataUrl } from '@boutique/shared';
import { toast } from 'sonner';
import { cn } from './ui/utils';

/** Product / category images — embedded as data URLs in catalog JSON (no separate upload API). */
export const CATALOG_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

type Props = {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  required?: boolean;
  showPreview?: boolean;
};

export function ImageUrlOrUploadField({
  value,
  onChange,
  className,
  inputClassName,
  placeholder = 'https://… or upload a file',
  required,
  showPreview = true,
}: Props) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const trimmed = value.trim();
  const isDataUrl = trimmed.startsWith('data:image/');
  const urlFieldValue = isDataUrl ? '' : value;

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Choose a PNG, JPG, WebP, or SVG image.');
      return;
    }
    if (file.size > CATALOG_IMAGE_MAX_BYTES) {
      toast.error(`Image must be under ${Math.round(CATALOG_IMAGE_MAX_BYTES / 1024 / 1024)} MB.`);
      return;
    }
    try {
      onChange(await readImageFileAsDataUrl(file));
      toast.success('Image uploaded');
    } catch {
      toast.error('Could not read that file.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2 items-start">
        <input
          id={inputId}
          type="text"
          className={cn('flex-1 min-w-0', inputClassName)}
          placeholder={isDataUrl ? 'Uploaded file — paste URL to replace' : placeholder}
          value={urlFieldValue}
          onChange={(e) => onChange(e.target.value)}
          required={required && !trimmed}
        />
        <label
          htmlFor={`${inputId}-file`}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload
        </label>
        <input
          ref={fileRef}
          id={`${inputId}-file`}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
        {trimmed && (
          <button
            type="button"
            title="Clear image"
            onClick={() => onChange('')}
            className="shrink-0 p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {isDataUrl && (
        <p className="text-[11px] text-gray-500">File embedded in catalog · max {Math.round(CATALOG_IMAGE_MAX_BYTES / 1024 / 1024)} MB</p>
      )}
      {showPreview && trimmed && (
        <img src={trimmed} alt="" className="w-20 h-20 rounded-lg object-cover border bg-gray-100" />
      )}
    </div>
  );
}
