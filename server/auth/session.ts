import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { parse, serialize } from 'cookie';

import type { AuthRepository } from '../authRepository';
import { verifyPassword, hashPassword } from './password';

export const SESSION_COOKIE = 'boutique_admin_session';

const SESSION_TTL_MS =
  (Number(process.env.SESSION_TTL_HOURS) > 0 ? Number(process.env.SESSION_TTL_HOURS) : 168) * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === 'production';
const cookieSameSite = (process.env.ADMIN_COOKIE_SAMESITE?.trim().toLowerCase() || (isProduction ? 'strict' : 'lax')) as
  | 'strict'
  | 'lax'
  | 'none';

function sessionExpiresAt(): Date {
  return new Date(Date.now() + SESSION_TTL_MS);
}

function readSessionToken(req: Request): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const cookies = parse(header);
  const raw = cookies[SESSION_COOKIE];
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

export interface AdminPublicUser {
  id: string;
  email: string;
  displayName: string;
}

function newSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/** Extend session on authenticated activity (sliding window). */
export function refreshAdminSession(authRepo: AuthRepository, req: Request): void {
  const token = readSessionToken(req);
  if (!token) return;
  const row = authRepo.findSessionByToken(token);
  if (!row) return;
  if (new Date(row.expires_at).getTime() <= Date.now()) return;
  authRepo.touchSession(token, sessionExpiresAt());
}

export function resolveAdminUser(req: Request, authRepo: AuthRepository): AdminPublicUser | null {
  authRepo.deleteExpiredSessions();
  const token = readSessionToken(req);
  if (!token) return null;

  const row = authRepo.findSessionByToken(token);
  if (!row) return null;

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    authRepo.deleteSession(token);
    return null;
  }

  const user = authRepo.findUserById(row.user_id);
  if (!user) {
    authRepo.deleteSession(token);
    return null;
  }

  return { id: user.id, email: user.email, displayName: user.display_name };
}

export function setSessionCookie(res: Response, token: string) {
  res.setHeader(
    'Set-Cookie',
    serialize(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: cookieSameSite,
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    }),
  );
}

export function clearSessionCookie(res: Response) {
  res.setHeader(
    'Set-Cookie',
    serialize(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: cookieSameSite,
      path: '/',
      maxAge: 0,
    }),
  );
}

export async function loginWithPassword(
  authRepo: AuthRepository,
  email: string,
  password: string,
): Promise<{ user: AdminPublicUser; token: string } | { error: string }> {
  const row = authRepo.findUserByEmail(email);
  if (!row) return { error: 'Invalid email or password' };

  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return { error: 'Invalid email or password' };

  const token = newSessionToken();
  authRepo.createSession(row.id, token, sessionExpiresAt());

  return {
    user: { id: row.id, email: row.email, displayName: row.display_name },
    token,
  };
}

export function logoutSession(authRepo: AuthRepository, req: Request) {
  const token = readSessionToken(req);
  if (token) authRepo.deleteSession(token);
}

export function sessionTtlHours(): number {
  return Number(process.env.SESSION_TTL_HOURS) > 0 ? Number(process.env.SESSION_TTL_HOURS) : 168;
}

export async function changeAdminPassword(
  authRepo: AuthRepository,
  req: Request,
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true } | { error: string }> {
  const user = resolveAdminUser(req, authRepo);
  if (!user) return { error: 'Not signed in' };

  const row = authRepo.findUserByEmail(user.email);
  if (!row) return { error: 'Account not found' };

  const ok = await verifyPassword(currentPassword, row.password_hash);
  if (!ok) return { error: 'Current password is incorrect' };

  if (newPassword.length < 8) return { error: 'New password must be at least 8 characters' };
  if (newPassword === currentPassword) return { error: 'Choose a different password' };

  const password_hash = await hashPassword(newPassword);
  const updated = authRepo.updatePassword(user.id, password_hash);
  if (!updated) return { error: 'Could not update password' };

  const token = readSessionToken(req);
  if (token) authRepo.deleteOtherSessionsExceptToken(user.id, token);

  return { ok: true };
}

export function revokeOtherAdminSessions(
  authRepo: AuthRepository,
  req: Request,
): { revoked: number } | { error: string } {
  const user = resolveAdminUser(req, authRepo);
  if (!user) return { error: 'Not signed in' };
  const token = readSessionToken(req);
  if (!token) return { error: 'No active session' };
  const revoked = authRepo.deleteOtherSessionsExceptToken(user.id, token);
  return { revoked };
}

export function adminSecuritySnapshot(authRepo: AuthRepository, req: Request) {
  const user = resolveAdminUser(req, authRepo);
  if (!user) return null;
  return {
    email: user.email,
    displayName: user.displayName,
    sessionTtlHours: sessionTtlHours(),
    activeSessions: authRepo.countActiveSessions(user.id),
    loginRequired: isProduction || !process.env.ALLOW_INSECURE_ADMIN_DEV,
    cookieHttpOnly: true,
    cookieSecure: isProduction,
    cookieSameSite,
  };
}
