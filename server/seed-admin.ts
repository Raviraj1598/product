/**
 * Create or reset the admin user from ADMIN_EMAIL / ADMIN_PASSWORD in root `.env`.
 * Usage: npm run seed:admin
 */
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import path from 'path';

import { loadEnv } from './loadEnv';
import { hashPasswordSync } from './auth/password';
import { createAuthRepository } from './authRepository';

loadEnv();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD?.trim();
const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || 'Store admin';

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env (copy from .env.example).');
  process.exit(1);
}
if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.');
  process.exit(1);
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const authRepo = createAuthRepository({ dirname });

// Reach into DB via a one-off upsert (reuse repository patterns)
import Database from 'better-sqlite3';

const dbPath = path.join(dirname, 'data', 'catalog.db');
const db = new Database(dbPath);

const existing = db
  .prepare(`SELECT id FROM admin_users WHERE email = ? COLLATE NOCASE`)
  .get(email) as { id: string } | undefined;

const password_hash = hashPasswordSync(password);

if (existing) {
  db.prepare(`UPDATE admin_users SET password_hash = ?, display_name = ? WHERE id = ?`).run(
    password_hash,
    displayName,
    existing.id,
  );
  db.prepare(`DELETE FROM admin_sessions WHERE user_id = ?`).run(existing.id);
  console.log(`[auth] Updated password for ${email}`);
} else {
  const id = `usr_${crypto.randomUUID().slice(0, 12)}`;
  db.prepare(
    `INSERT INTO admin_users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)`,
  ).run(id, email, password_hash, displayName);
  console.log(`[auth] Created admin ${email}`);
}

db.close();
authRepo.close();
