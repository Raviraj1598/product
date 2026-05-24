import type { AdminUser } from '../types/auth';
import type { AdminSecuritySnapshot } from '../types';

export type { AdminSecuritySnapshot };

function apiBase(): string {
  return import.meta.env.VITE_API_URL ?? '';
}

const jsonOpts = {
  credentials: 'include' as RequestCredentials,
  headers: { 'Content-Type': 'application/json' },
};

export async function fetchAuthMe(): Promise<AdminUser | null> {
  const res = await fetch(`${apiBase()}/api/auth/me`, { credentials: 'include' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);
  const data = (await res.json()) as { user: AdminUser };
  return data.user ?? null;
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const res = await fetch(`${apiBase()}/api/auth/login`, {
    method: 'POST',
    ...jsonOpts,
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { user?: AdminUser; error?: string };
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (!data.user) throw new Error('Login failed');
  return data.user;
}

export async function logoutAdmin(): Promise<void> {
  await fetch(`${apiBase()}/api/auth/logout`, { method: 'POST', credentials: 'include' });
}

export async function fetchAdminSecurity(): Promise<AdminSecuritySnapshot> {
  const res = await fetch(`${apiBase()}/api/auth/security`, { credentials: 'include' });
  if (res.status === 401) throw new Error('AUTH_REQUIRED');
  const body = (await res.json()) as AdminSecuritySnapshot & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Security fetch failed (${res.status})`);
  return body;
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${apiBase()}/api/auth/change-password`, {
    method: 'POST',
    ...jsonOpts,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const body = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(body.error ?? 'Could not change password');
}

export async function revokeOtherAdminSessions(): Promise<number> {
  const res = await fetch(`${apiBase()}/api/auth/revoke-sessions`, {
    method: 'POST',
    credentials: 'include',
  });
  const body = (await res.json()) as { revoked?: number; error?: string };
  if (!res.ok) throw new Error(body.error ?? 'Could not revoke sessions');
  return body.revoked ?? 0;
}
