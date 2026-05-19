import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { parse, serialize } from 'cookie';

import type { AuthRepository } from '../authRepository';
import { verifyPassword } from './password';

export const SESSION_COOKIE = 'boutique_admin_session';

const SESSION_TTL_MS =
  (Number(process.env.SESSION_TTL_HOURS) > 0 ? Number(process.env.SESSION_TTL_HOURS) : 168) * 60 * 60 * 1000;

export interface AdminPublicUser {
  id: string;
  email: string;
  displayName: string;
}

function newSessionToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function readSessionToken(req: Request): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  const cookies = parse(header);
  const raw = cookies[SESSION_COOKIE];
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
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
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    serialize(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    }),
  );
}

export function clearSessionCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    serialize(SESSION_COOKIE, '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
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
  authRepo.createSession(row.id, token, new Date(Date.now() + SESSION_TTL_MS));

  return {
    user: { id: row.id, email: row.email, displayName: row.display_name },
    token,
  };
}

export function logoutSession(authRepo: AuthRepository, req: Request) {
  const token = readSessionToken(req);
  if (token) authRepo.deleteSession(token);
}
