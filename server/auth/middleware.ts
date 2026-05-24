import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

import type { AuthRepository } from '../authRepository';
import { resolveAdminUser, refreshAdminSession } from './session';

const ADMIN_SECRET = process.env.ADMIN_API_SECRET?.trim();
const isProduction = process.env.NODE_ENV === 'production';

function adminTokenMatches(secret: string, presentedRaw: unknown): boolean {
  if (typeof presentedRaw !== 'string' || !presentedRaw.trim()) return false;
  const presented = presentedRaw.trim();
  try {
    const hSecret = crypto.createHash('sha256').update(secret, 'utf8').digest();
    const hTok = crypto.createHash('sha256').update(presented, 'utf8').digest();
    return crypto.timingSafeEqual(hSecret, hTok);
  } catch {
    return false;
  }
}

/** Session cookie (preferred) or legacy `x-admin-token` for automation; dev may run open without secrets. */
export function createRequireAdmin(authRepo: AuthRepository) {
  return function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (resolveAdminUser(req, authRepo)) {
      refreshAdminSession(authRepo, req);
      next();
      return;
    }

    if (ADMIN_SECRET) {
      const hdr = req.headers['x-admin-token'];
      if (adminTokenMatches(ADMIN_SECRET, hdr)) {
        next();
        return;
      }
    }

    if (!isProduction && !ADMIN_SECRET && process.env.ALLOW_INSECURE_ADMIN_DEV === '1') {
      console.warn('[auth] ALLOW_INSECURE_ADMIN_DEV=1 — allowing admin route without login (development only)');
      next();
      return;
    }

    res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
  };
}
