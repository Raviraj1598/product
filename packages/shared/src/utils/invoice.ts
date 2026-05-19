/** Generate a display invoice number for new orders. */
export function formatInvoiceNumber(seq: number, date = new Date()): string {
  const y = date.getFullYear();
  const n = String(Math.max(1, seq)).padStart(5, '0');
  return `INV-${y}-${n}`;
}
