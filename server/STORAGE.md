# Data storage

The Boutique API persists the **entire catalog envelope** inside **`server/data/catalog.db`** (SQLite, WAL journaling). A legacy migration path reads `server/data/catalog.json` exactly once **if** the SQLite row is missing (older installs retain their single-file payload).

## How SQLite is used

- **Tables** `catalog_snap` holds a single row (`id = 1`) whose `json` column is the full catalog snapshot (products, categories, orders, reviews, coupons, settings, CMS pages).
- **`catalog_meta`** stores `schema_version` for forward migrations.
- **Reads**: `SELECT json FROM catalog_snap WHERE id = 1`, then `JSON.parse` + `normalizeParsedCatalog`.
- **Writes**: `INSERT OR REPLACE` overwrites row 1 in one statement (SQLite WAL persists durable enough for this demo storefront).
- **Pragmas**: `journal_mode = WAL`, `foreign_keys = ON`.
- **`SIGINT` / `SIGTERM`**: the Node process closes the HTTP server then `better-sqlite3` `close()` so WAL/checkpoint state is orderly on deploy restarts.

Envelope shape (mirrors `@boutique/shared` types):

| Area | Persistence |
| --- | --- |
| Products, categories | JSON column snapshot |
| Reviews, coupons, orders | Snapshot |
| `settings` incl. **`theme`, `shippingMethods`, `paymentMethods`** | Snapshot (`mergeStoreSettings` hydrates gaps) |
| `builtPages` | Snapshot (storefront `/api/store/catalog` hides drafts) |

## Security model

| Route | Behaviour |
| --- | --- |
| `GET /api/store/catalog` & `GET /api/catalog` | **Public storefront read** · rate limited (`PUBLIC_CATALOG_RATE_LIMIT_MAX`). Strips orders, sanitises coupons (`usageRemaining` only), returns **published CMS pages**. |
| `GET /PUT /api/admin/catalog` | **Admin surface** · full dataset · rate limited (`ADMIN_CATALOG_RATE_LIMIT_MAX`). **`ADMIN_API_SECRET` required whenever `NODE_ENV=production`**; header `x-admin-token` validated with **SHA-256 + timing-safe equality** against the secret hash. Omitting secret in production returns `503`. |
| `POST /api/orders` | **Public checkout** · rate limited (`express-rate-limit`, tunable via `ORDER_RATE_LIMIT_MAX`). |
| `PUT /api/catalog` legacy | **`410 Gone`** — clients must migrate to `/api/admin/catalog`. |

### Client apps

| App | Behaviour |
| --- | --- |
| Storefront (Vite) | `__ADMIN_BUILD__=false` → reads `/api/store/catalog`, never `PUT`s the catalog envelope. Cart & wishlists stay browser-local. |
| Admin (Vite) | `__ADMIN_BUILD__=true` → reads/writes `/api/admin/catalog`; debounced PUT requires `VITE_ADMIN_API_TOKEN` aligning with backend secret. |

**Important**: The admin SPA embeds `VITE_*` at build time, so anyone with the deployed admin bundle URL can theoretically extract that token unless you additionally protect the admin hostname (VPN, SSO, Basic Auth at the edge, or IP allowlist). Treat **`ADMIN_API_SECRET` as gatekeeping edit access**, not a substitute for securing who can load the admin app.

### Stack hardening (Express)

| Layer | Behaviour |
| --- | --- |
| **Helmet** | Sets standard security-related HTTP headers (CSP omitted for plain JSON APIs; `Cross-Origin-Resource-Policy: cross-origin` so CORS fetches behave predictably). |
| **Timings — admin token** | `x-admin-token` is matched with **SHA-256 + `timingSafeEqual`** vs the configured secret hash so guesses do not leak token length hints. |
| **Rate limits** | Public catalog `GET`s, admin catalog (`GET`+`PUT`), and `POST /api/orders` each have configurable windows (`PUBLIC_CATALOG_RATE_LIMIT_MAX`, `ADMIN_CATALOG_RATE_LIMIT_MAX`, `ORDER_RATE_LIMIT_MAX`). Use **`TRUST_PROXY=1`** behind a trusted reverse proxy so limits key off real client IPs. |
| **Body size** | `express.json({ limit: CATALOG_JSON_LIMIT })` caps oversized payloads against memory abuse. |

## Environment knobs

See repository root `.env.example` for canonical env vars (`ADMIN_API_SECRET`, `CORS_ORIGINS`, Stripe publishable placeholders, rate limits, `TRUST_PROXY`, etc.).

