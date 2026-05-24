import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

import type { Coupon } from '../packages/shared/src/types';
import type { CatalogJson } from './catalogService';
import {
  catalogLegacyDefaultPath,
  normalizeParsedCatalog,
  readLegacyCatalogJsonSync,
} from './catalogService';
import { mergeStoreSettings } from '../packages/shared/src/catalog/storeSettings';
import { normalizeBuiltPages } from '../packages/shared/src/cms/normalizeBuiltPages';
import { catalogNeedsDefaultSeed } from '../packages/shared/src/cms/catalogDefaults';

const SCHEMA_VERSION = 1;

const DDL = `
CREATE TABLE IF NOT EXISTS catalog_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS catalog_snap (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

function ensureDir(forPath: string) {
  fs.mkdirSync(path.dirname(forPath), { recursive: true });
}

export interface CatalogRepo {
  read(): CatalogJson;
  write(next: CatalogJson): void;
  close(): void;
}

/** Open SQLite catalog (single logical row). Migrates legacy catalog.json once if DB empty. */
export function createCatalogRepository(options: {
  dirname: string;
  dbFilename?: string;
}): CatalogRepo {
  const dbPath = path.join(options.dirname, 'data', options.dbFilename ?? 'catalog.db');
  ensureDir(dbPath);

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(DDL);

  const metaLoaded = db.prepare(`SELECT value FROM catalog_meta WHERE key = 'schema_version'`).get() as { value?: string };
  const snap = db.prepare(`SELECT json FROM catalog_snap WHERE id = 1`).get() as { json?: string } | undefined;

  if (!snap?.json) {
    const legacyPath = catalogLegacyDefaultPath(options.dirname);
    let initial = readLegacyCatalogJsonSync(legacyPath);
    if (!initial) {
      initial = normalizeParsedCatalog({});
    }
    const tx = db.transaction(() => {
      db.prepare(
        `INSERT OR REPLACE INTO catalog_snap (id, json, updated_at) VALUES (1, ?, datetime('now'))`,
      ).run(JSON.stringify(initial));
      db.prepare(`INSERT OR REPLACE INTO catalog_meta (key, value) VALUES ('schema_version', ?)`).run(
        String(SCHEMA_VERSION),
      );
    });
    tx();

    console.log(`[catalog] Initialized SQLite (${dbPath}) from ${initial ? legacyPath || 'defaults' : 'defaults'}`);
  } else if (!metaLoaded?.value) {
    db.prepare(`INSERT OR REPLACE INTO catalog_meta (key, value) VALUES ('schema_version', ?)`).run(
      String(SCHEMA_VERSION),
    );
  }

  return {
    read() {
      const row = db.prepare(`SELECT json FROM catalog_snap WHERE id = 1`).get() as { json: string };
      const rawJson = JSON.parse(row.json) as unknown;
      const rawRecord = typeof rawJson === 'object' && rawJson !== null ? (rawJson as Record<string, unknown>) : {};
      const needsSeed = catalogNeedsDefaultSeed(
        normalizeBuiltPages(rawRecord.builtPages),
        mergeStoreSettings(
          typeof rawRecord.settings === 'object' && rawRecord.settings !== null
            ? (rawRecord.settings as Partial<import('../packages/shared/src/types').StoreSettings>)
            : undefined,
        ),
      );
      const next = normalizeParsedCatalog(rawJson);
      if (needsSeed) {
        db.prepare(`INSERT OR REPLACE INTO catalog_snap (id, json, updated_at) VALUES (1, ?, datetime('now'))`).run(
          JSON.stringify(next),
        );
      }
      return next;
    },

    write(next: CatalogJson) {
      db.prepare(`INSERT OR REPLACE INTO catalog_snap (id, json, updated_at) VALUES (1, ?, datetime('now'))`).run(
        JSON.stringify(next),
      );
    },

    close() {
      db.close();
    },
  };
}

/** Strip internal coupon usage counts — storefront validates with remaining capacity only. */
export function couponsSafeForStorefront(coupons: Coupon[]): Omit<Coupon, 'usageCount'>[] {
  return coupons.map((c) => {
    const { usageCount: usedRaw, ...rest } = c;
    const used = usedRaw ?? 0;
    if (rest.usageLimit != null) {
      return { ...rest, usageRemaining: Math.max(0, rest.usageLimit - used) };
    }
    return { ...rest };
  }) as Omit<Coupon, 'usageCount'>[];
}
