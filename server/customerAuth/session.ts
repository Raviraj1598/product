import crypto from 'node:crypto';
import type { Request, Response } from 'express';
import { parse, serialize } from 'cookie';

import type { Customer } from '../../packages/shared/src/types';
import type { CustomerUser } from '../../packages/shared/src/types/auth';
import type { CustomerRepository } from '../customerRepository';
import { verifyPassword } from '../auth/password';

export const CUSTOMER_SESSION_COOKIE = 'boutique_customer_session';

const SESSION_TTL_MS =
  (Number(process.env.CUSTOMER_SESSION_TTL_HOURS) > 0
    ? Number(process.env.CUSTOMER_SESSION_TTL_HOURS)
    : 168) *
  60 *
  60 *
  1000;

function readToken(req: Request): string | undefined {
  const raw = parse(req.headers.cookie ?? '')[CUSTOMER_SESSION_COOKIE];
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

export function customerToUser(c: Customer): CustomerUser {
  return {
    id: c.id,
    email: c.email,
    name: c.name,
    phone: c.phone,
    addressLine1: c.addressLine1,
    city: c.city,
    zipCode: c.zipCode,
    country: c.country,
  };
}

export function resolveCustomerId(req: Request, customerRepo: CustomerRepository): string | null {
  customerRepo.deleteExpiredSessions();
  const token = readToken(req);
  if (!token) return null;
  const row = customerRepo.findSessionByToken(token);
  if (!row) return null;
  if (new Date(row.expires_at).getTime() <= Date.now()) {
    customerRepo.deleteSession(token);
    return null;
  }
  return row.customer_id;
}

export function setCustomerSessionCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    serialize(CUSTOMER_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: Math.floor(SESSION_TTL_MS / 1000),
    }),
  );
}

export function clearCustomerSessionCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    serialize(CUSTOMER_SESSION_COOKIE, '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    }),
  );
}

export async function loginCustomer(
  customerRepo: CustomerRepository,
  email: string,
  password: string,
): Promise<{ customerId: string; token: string } | { error: string }> {
  const row = customerRepo.findByEmail(email);
  if (!row) return { error: 'Invalid email or password' };
  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) return { error: 'Invalid email or password' };
  const token = crypto.randomBytes(32).toString('base64url');
  customerRepo.createSession(row.customer_id, token, new Date(Date.now() + SESSION_TTL_MS));
  return { customerId: row.customer_id, token };
}

export function logoutCustomer(req: Request, customerRepo: CustomerRepository) {
  const token = readToken(req);
  if (token) customerRepo.deleteSession(token);
}
