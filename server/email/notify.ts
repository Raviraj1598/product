import type { Order, StoreSettings } from '../../packages/shared/src/types';
import { mergeStoreSettings } from '../../packages/shared/src/catalog/storeSettings';

export type EmailSendResult = { sent: boolean; reason?: string };

function smtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.EMAIL_FROM?.trim() &&
      (process.env.SMTP_USER?.trim() || process.env.RESEND_API_KEY?.trim()),
  );
}

function orderNotifyRecipient(settings: StoreSettings): string | null {
  const admin = mergeStoreSettings(settings).adminPanel;
  if (!admin.orderNotifyEnabled) return null;
  const to = admin.orderNotifyEmail?.trim() || admin.supportEmail?.trim();
  return to || null;
}

function formatOrderPlainText(order: Order, settings: StoreSettings): string {
  const site = mergeStoreSettings(settings).siteName;
  const lines = [
    `New order on ${site}`,
    '',
    `Invoice: ${order.invoiceNumber ?? order.id}`,
    `Customer: ${order.customerName}`,
    `Email: ${order.customerEmail}`,
    `Phone: ${order.customerPhone}`,
    `Total: $${order.total.toFixed(2)}`,
    '',
    'Items:',
    ...order.items.map(
      (i) => `- ${i.productName} × ${i.quantity} @ $${i.price.toFixed(2)}`,
    ),
  ];
  return lines.join('\n');
}

/** Best-effort order alert — configure SMTP or Resend in .env (see Admin → Settings → Notifications). */
export async function sendOrderNotification(
  order: Order,
  settings: StoreSettings,
): Promise<EmailSendResult> {
  const to = orderNotifyRecipient(settings);
  if (!to) return { sent: false, reason: 'Order notifications disabled in Admin settings' };

  const subject = `New order ${order.invoiceNumber ?? order.id.slice(0, 8)} — ${mergeStoreSettings(settings).siteName}`;
  const text = formatOrderPlainText(order, settings);

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  if (resendKey && from) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: [to], subject, text }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { sent: false, reason: `Resend error: ${body.slice(0, 200)}` };
      }
      return { sent: true };
    } catch (e) {
      return { sent: false, reason: e instanceof Error ? e.message : 'Resend request failed' };
    }
  }

  if (!smtpConfigured()) {
    console.log(`[email] Order notification (not sent — configure RESEND_API_KEY or SMTP in .env):\n${text}`);
    return {
      sent: false,
      reason: 'No mail provider configured. Set RESEND_API_KEY + EMAIL_FROM or SMTP_* in .env',
    };
  }

  console.log(`[email] SMTP configured but direct SMTP send not wired — use Resend API or check logs:\n${text}`);
  return { sent: false, reason: 'Use RESEND_API_KEY + EMAIL_FROM for automatic order emails' };
}

export function emailProviderStatus(): {
  resend: boolean;
  smtp: boolean;
  from: string | null;
} {
  return {
    resend: Boolean(process.env.RESEND_API_KEY?.trim()),
    smtp: Boolean(process.env.SMTP_HOST?.trim()),
    from: process.env.EMAIL_FROM?.trim() || null,
  };
}
