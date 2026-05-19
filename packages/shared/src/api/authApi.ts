import type { AdminUser } from '../types/auth';

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
