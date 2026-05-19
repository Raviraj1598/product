import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';

import { hashPasswordSync } from './auth/password';

const AUTH_DDL = `
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
`;

export interface AdminUserRow {
  id: string;
  email: string;
  display_name: string;
}

export interface AuthRepository {
  findUserByEmail(email: string): { id: string; email: string; password_hash: string; display_name: string } | undefined;
  findUserById(id: string): AdminUserRow | undefined;
  createSession(userId: string, rawToken: string, expiresAt: Date): void;
  findSessionByToken(rawToken: string): { user_id: string; expires_at: string } | undefined;
  deleteSession(rawToken: string): void;
  deleteExpiredSessions(): void;
  close(): void;
}

function hashSessionToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

function ensureDir(forPath: string) {
  fs.mkdirSync(path.dirname(forPath), { recursive: true });
}

function bootstrapAdminFromEnv(db: Database.Database) {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || 'Store admin';

  if (!email || !password) return;
  if (password.length < 8) {
    console.warn('[auth] ADMIN_PASSWORD must be at least 8 characters to seed the first admin user');
    return;
  }

  const id = `usr_${crypto.randomUUID().slice(0, 12)}`;
  const password_hash = hashPasswordSync(password);

  db.prepare(`INSERT INTO admin_users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)`).run(
    id,
    email,
    password_hash,
    displayName,
  );
  console.log(`[auth] Seeded admin user ${email}`);
}

/** Admin users + sessions in the same SQLite file as catalog. */
export function createAuthRepository(options: { dirname: string; dbFilename?: string }): AuthRepository {
  const dbPath = path.join(options.dirname, 'data', options.dbFilename ?? 'catalog.db');
  ensureDir(dbPath);

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(AUTH_DDL);

  const userCount = (db.prepare(`SELECT COUNT(*) AS n FROM admin_users`).get() as { n: number }).n;
  if (userCount === 0) {
    bootstrapAdminFromEnv(db);
  }
  const finalCount = (db.prepare(`SELECT COUNT(*) AS n FROM admin_users`).get() as { n: number }).n;
  if (finalCount === 0) {
    console.warn(
      '[auth] No admin users — copy .env.example → .env with ADMIN_EMAIL + ADMIN_PASSWORD (min 8 chars), then restart API or run: npm run seed:admin',
    );
  } else {
    const emails = db.prepare(`SELECT email FROM admin_users`).all() as { email: string }[];
    console.log(`[auth] ${finalCount} admin account(s): ${emails.map((r) => r.email).join(', ')}`);
  }

  return {
    findUserByEmail(email: string) {
      return db
        .prepare(
          `SELECT id, email, password_hash, display_name FROM admin_users WHERE email = ? COLLATE NOCASE LIMIT 1`,
        )
        .get(email.trim().toLowerCase()) as
        | { id: string; email: string; password_hash: string; display_name: string }
        | undefined;
    },

    findUserById(id: string) {
      return db
        .prepare(`SELECT id, email, display_name FROM admin_users WHERE id = ? LIMIT 1`)
        .get(id) as AdminUserRow | undefined;
    },

    createSession(userId: string, rawToken: string, expiresAt: Date) {
      const id = `ses_${crypto.randomUUID().slice(0, 12)}`;
      db.prepare(
        `INSERT INTO admin_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      ).run(id, userId, hashSessionToken(rawToken), expiresAt.toISOString());
    },

    findSessionByToken(rawToken: string) {
      return db
        .prepare(`SELECT user_id, expires_at FROM admin_sessions WHERE token_hash = ? LIMIT 1`)
        .get(hashSessionToken(rawToken)) as { user_id: string; expires_at: string } | undefined;
    },

    deleteSession(rawToken: string) {
      db.prepare(`DELETE FROM admin_sessions WHERE token_hash = ?`).run(hashSessionToken(rawToken));
    },

    deleteExpiredSessions() {
      db.prepare(`DELETE FROM admin_sessions WHERE expires_at < datetime('now')`).run();
    },

    close() {
      db.close();
    },
  };
}
