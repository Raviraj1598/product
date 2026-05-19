import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'fs';
import path from 'path';

import { hashPasswordSync } from './auth/password';

const DDL = `
CREATE TABLE IF NOT EXISTS customer_credentials (
  customer_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS customer_sessions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customer_sessions_customer ON customer_sessions(customer_id);
`;

export interface CustomerCredentialsRow {
  customer_id: string;
  email: string;
  password_hash: string;
}

export interface CustomerRepository {
  findByEmail(email: string): CustomerCredentialsRow | undefined;
  findByCustomerId(customerId: string): CustomerCredentialsRow | undefined;
  upsertCredentials(customerId: string, email: string, passwordHash: string): void;
  updatePassword(customerId: string, passwordHash: string): void;
  createSession(customerId: string, rawToken: string, expiresAt: Date): void;
  findSessionByToken(rawToken: string): { customer_id: string; expires_at: string } | undefined;
  deleteSession(rawToken: string): void;
  deleteExpiredSessions(): void;
  close(): void;
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

export function createCustomerRepository(options: { dirname: string }): CustomerRepository {
  const dbPath = path.join(options.dirname, 'data', 'catalog.db');
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.exec(DDL);

  return {
    findByEmail(email: string) {
      return db
        .prepare(`SELECT customer_id, email, password_hash FROM customer_credentials WHERE email = ? COLLATE NOCASE`)
        .get(email.trim().toLowerCase()) as CustomerCredentialsRow | undefined;
    },

    findByCustomerId(customerId: string) {
      return db
        .prepare(`SELECT customer_id, email, password_hash FROM customer_credentials WHERE customer_id = ?`)
        .get(customerId) as CustomerCredentialsRow | undefined;
    },

    upsertCredentials(customerId: string, email: string, passwordHash: string) {
      db.prepare(
        `INSERT INTO customer_credentials (customer_id, email, password_hash) VALUES (?, ?, ?)
         ON CONFLICT(customer_id) DO UPDATE SET email = excluded.email, password_hash = excluded.password_hash`,
      ).run(customerId, email.trim().toLowerCase(), passwordHash);
    },

    updatePassword(customerId: string, passwordHash: string) {
      db.prepare(`UPDATE customer_credentials SET password_hash = ? WHERE customer_id = ?`).run(
        passwordHash,
        customerId,
      );
    },

    createSession(customerId: string, rawToken: string, expiresAt: Date) {
      const id = `cses_${crypto.randomUUID().slice(0, 12)}`;
      db.prepare(
        `INSERT INTO customer_sessions (id, customer_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      ).run(id, customerId, hashToken(rawToken), expiresAt.toISOString());
    },

    findSessionByToken(rawToken: string) {
      return db
        .prepare(`SELECT customer_id, expires_at FROM customer_sessions WHERE token_hash = ?`)
        .get(hashToken(rawToken)) as { customer_id: string; expires_at: string } | undefined;
    },

    deleteSession(rawToken: string) {
      db.prepare(`DELETE FROM customer_sessions WHERE token_hash = ?`).run(hashToken(rawToken));
    },

    deleteExpiredSessions() {
      db.prepare(`DELETE FROM customer_sessions WHERE expires_at < datetime('now')`).run();
    },

    close() {
      db.close();
    },
  };
}

export { hashPasswordSync };
