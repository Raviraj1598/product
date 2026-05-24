import { useEffect, useState } from 'react';
import type { StoreSettings } from '@boutique/shared';
import {
  mergeStoreSettings,
  fetchAdminSecurity,
  changeAdminPassword,
  revokeOtherAdminSessions,
  type AdminSecuritySnapshot,
} from '@boutique/shared';
import { toast } from 'sonner';
import { useAuth } from '../../auth/AuthContext';
import { configFld, ConfigFieldRow, ConfigFieldset } from './ConfigPrimitives';
import type { ConfigDraftProps } from './ConfigSectionPanels';

function patchAdminPanel(
  draft: StoreSettings,
  patch: Partial<StoreSettings['adminPanel']>,
): StoreSettings {
  return {
    ...draft,
    adminPanel: { ...mergeStoreSettings(draft).adminPanel, ...patch },
  };
}

export function AdminPanelConfigSection({ draft, setDraft }: ConfigDraftProps) {
  const m = mergeStoreSettings(draft);

  return (
    <div className="space-y-6">
      <ConfigFieldset title="Sidebar branding">
        <ConfigFieldRow label="Panel title">
          <input
            className={configFld}
            value={m.adminPanel.panelTitle}
            onChange={(e) => setDraft((d) => patchAdminPanel(d, { panelTitle: e.target.value }))}
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="Panel subtitle">
          <input
            className={configFld}
            value={m.adminPanel.panelSubtitle}
            onChange={(e) => setDraft((d) => patchAdminPanel(d, { panelSubtitle: e.target.value }))}
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="Accent color">
          <div className="flex gap-2 items-center">
            <input
              type="color"
              className="h-10 w-14 cursor-pointer rounded border border-gray-300"
              value={
                m.adminPanel.accentColor.startsWith('#')
                  ? m.adminPanel.accentColor.slice(0, 7)
                  : '#f97316'
              }
              onChange={(e) => setDraft((d) => patchAdminPanel(d, { accentColor: e.target.value }))}
            />
            <input
              type="text"
              className={`${configFld} font-mono text-xs max-w-[120px]`}
              value={m.adminPanel.accentColor}
              onChange={(e) => setDraft((d) => patchAdminPanel(d, { accentColor: e.target.value }))}
            />
          </div>
        </ConfigFieldRow>
        <ConfigFieldRow label="Support email">
          <input
            type="email"
            className={configFld}
            value={m.adminPanel.supportEmail}
            onChange={(e) => setDraft((d) => patchAdminPanel(d, { supportEmail: e.target.value }))}
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="View storefront link">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={m.adminPanel.showStorefrontLink}
              onChange={(e) =>
                setDraft((d) => patchAdminPanel(d, { showStorefrontLink: e.target.checked }))
              }
            />
            Show in sidebar footer
          </label>
        </ConfigFieldRow>
      </ConfigFieldset>

      <ConfigFieldset title="Products">
        <ConfigFieldRow label="Default new product type">
          <select
            className={configFld}
            value={m.adminPanel.defaultProductMode}
            onChange={(e) =>
              setDraft((d) =>
                patchAdminPanel(d, {
                  defaultProductMode: e.target.value as typeof m.adminPanel.defaultProductMode,
                }),
              )
            }
          >
            <option value="picker">Ask every time</option>
            <option value="affiliate">Affiliate product</option>
            <option value="internal">In-store product</option>
          </select>
        </ConfigFieldRow>
      </ConfigFieldset>

      <ConfigFieldset title="Dashboard">
        <ConfigFieldRow label="Welcome note">
          <textarea
            rows={4}
            className={configFld}
            value={m.adminPanel.dashboardNote}
            onChange={(e) => setDraft((d) => patchAdminPanel(d, { dashboardNote: e.target.value }))}
          />
        </ConfigFieldRow>
      </ConfigFieldset>
    </div>
  );
}

export function AdminNotificationsConfigSection({ draft, setDraft }: ConfigDraftProps) {
  const m = mergeStoreSettings(draft);
  const [mailStatus, setMailStatus] = useState<AdminSecuritySnapshot | null>(null);

  useEffect(() => {
    void fetchAdminSecurity()
      .then(setMailStatus)
      .catch(() => setMailStatus(null));
  }, []);

  return (
    <div className="space-y-6">
      <ConfigFieldset title="New order alerts">
        <ConfigFieldRow label="Send email on new checkout order">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={m.adminPanel.orderNotifyEnabled}
              onChange={(e) =>
                setDraft((d) => patchAdminPanel(d, { orderNotifyEnabled: e.target.checked }))
              }
            />
            Enabled
          </label>
        </ConfigFieldRow>
        <ConfigFieldRow label="Notification email" comment="Leave empty to use support email above.">
          <input
            type="email"
            className={configFld}
            placeholder={m.adminPanel.supportEmail}
            value={m.adminPanel.orderNotifyEmail}
            onChange={(e) =>
              setDraft((d) => patchAdminPanel(d, { orderNotifyEmail: e.target.value }))
            }
          />
        </ConfigFieldRow>
        <ConfigFieldRow label="Setup note" comment="Your own instructions for mail/API keys — shown only here.">
          <textarea
            rows={4}
            className={configFld}
            placeholder="e.g. Set RESEND_API_KEY and EMAIL_FROM in server .env"
            value={m.adminPanel.orderNotifyHelpNote}
            onChange={(e) =>
              setDraft((d) => patchAdminPanel(d, { orderNotifyHelpNote: e.target.value }))
            }
          />
        </ConfigFieldRow>
        {mailStatus && (
          <ConfigFieldRow label="Mail provider (server)">
            <p className="text-sm text-gray-700">
              {mailStatus.emailProviderConfigured ? 'Configured' : 'Not configured on server'}
            </p>
          </ConfigFieldRow>
        )}
      </ConfigFieldset>
    </div>
  );
}

export function AdminSecurityConfigSection() {
  const { user } = useAuth();
  const [security, setSecurity] = useState<AdminSecuritySnapshot | null>(null);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [revokeBusy, setRevokeBusy] = useState(false);

  useEffect(() => {
    void fetchAdminSecurity()
      .then(setSecurity)
      .catch(() => setSecurity(null));
  }, [user?.id]);

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('New passwords do not match.');
      return;
    }
    setPwBusy(true);
    try {
      await changeAdminPassword(currentPw, newPw);
      toast.success('Password updated.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setSecurity(await fetchAdminSecurity());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change password');
    } finally {
      setPwBusy(false);
    }
  };

  const onRevokeOthers = async () => {
    setRevokeBusy(true);
    try {
      const n = await revokeOtherAdminSessions();
      toast.success(n > 0 ? `Signed out ${n} other session(s).` : 'No other active sessions.');
      setSecurity(await fetchAdminSecurity());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not revoke sessions');
    } finally {
      setRevokeBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <ConfigFieldset title="Account">
        {security ? (
          <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <dt className="text-gray-500">Signed in as</dt>
              <dd className="font-medium text-gray-900">{security.email}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Session lifetime</dt>
              <dd className="font-medium text-gray-900">{security.sessionTtlHours} hours</dd>
            </div>
            <div>
              <dt className="text-gray-500">Active sessions</dt>
              <dd className="font-medium text-gray-900">{security.activeSessions}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Login enforcement</dt>
              <dd className="font-medium text-gray-900">
                {security.loginRequired ? 'Required' : 'Dev mode'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Session cookie</dt>
              <dd className="font-medium text-gray-900 text-xs">
                HttpOnly · SameSite={security.cookieSameSite}
                {security.cookieSecure ? ' · Secure' : ''}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-gray-500 mb-4">Loading…</p>
        )}
        <button
          type="button"
          disabled={revokeBusy}
          onClick={() => void onRevokeOthers()}
          className="text-sm px-4 py-2 border border-gray-300 rounded-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {revokeBusy ? 'Signing out…' : 'Sign out all other devices'}
        </button>
      </ConfigFieldset>

      <form onSubmit={onChangePassword} className="space-y-4">
        <ConfigFieldset title="Change password">
          <ConfigFieldRow label="Current password">
            <input
              type="password"
              autoComplete="current-password"
              required
              className={configFld}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
          </ConfigFieldRow>
          <ConfigFieldRow label="New password">
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={configFld}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
          </ConfigFieldRow>
          <ConfigFieldRow label="Confirm new password">
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className={configFld}
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </ConfigFieldRow>
          <button
            type="submit"
            disabled={pwBusy}
            className="text-sm px-4 py-2 bg-gray-900 text-white rounded-sm hover:bg-black disabled:opacity-50"
          >
            {pwBusy ? 'Updating…' : 'Update password'}
          </button>
        </ConfigFieldset>
      </form>
    </div>
  );
}
