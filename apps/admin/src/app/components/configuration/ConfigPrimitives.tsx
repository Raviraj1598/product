import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, type ReactNode } from 'react';

export const configFld =
  'w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm bg-white';

/** Magento-style label | value row */
export function ConfigFieldRow({
  label,
  required,
  comment,
  children,
}: {
  label: string;
  required?: boolean;
  comment?: string;
  children: ReactNode;
}) {
  return (
    <tr className="border-b border-gray-200 last:border-b-0 align-top">
      <th
        scope="row"
        className="w-[28%] min-w-[200px] py-4 pr-6 pl-1 text-left text-sm font-normal text-gray-800 align-top"
      >
        <span>
          {label}
          {required ? <span className="text-red-600 ml-0.5">*</span> : null}
        </span>
      </th>
      <td className="py-4 pr-4">
        <div className="max-w-xl">{children}</div>
        {comment ? <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-2xl">{comment}</p> : null}
      </td>
    </tr>
  );
}

/** Collapsible field group (Magento field-set) */
export function ConfigFieldset({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-300 rounded-sm mb-6 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-[#f5f5f5] border-b border-gray-300 text-left text-sm font-semibold text-gray-800 hover:bg-[#ebebeb]"
      >
        {open ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
        {title}
      </button>
      {open ? (
        <div className="px-4 py-2">
          <table className="w-full border-collapse">
            <tbody>{children}</tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
