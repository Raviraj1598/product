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
| `POST /api/auth/login` | Email + password → **httpOnly session cookie** (`boutique_admin_session`). Rate limited (`LOGIN_RATE_LIMIT_MAX`). |
| `GET /api/auth/me` | Returns signed-in admin profile or `401`. |
| `POST /api/auth/logout` | Clears session cookie. |
| `GET /api/store/catalog` & `GET /api/catalog` | **Public storefront read** · rate limited. Strips orders, sanitises coupons, returns **published CMS pages** only. |
| `GET /PUT /api/admin/catalog` | **Admin surface** · requires **valid session** (or legacy `x-admin-token` when `ADMIN_API_SECRET` is set). |
| `POST /api/orders` | **Public checkout** · rate limited. |
| `PUT /api/catalog` legacy | **`410 Gone`** — use session auth + `/api/admin/catalog`. |

### Admin accounts (SQLite)

Tables `admin_users` and `admin_sessions` live in the same `catalog.db` file.

**First boot:** if no users exist, the API seeds one account from `ADMIN_EMAIL` + `ADMIN_PASSWORD` (password must be ≥ 8 characters). Change the password after deploy by updating the hash in DB or re-seeding in dev.

### Client apps

| App | Behaviour |
| --- | --- |
| Storefront (Vite) | Public catalog only; no admin session. |
| Admin (Vite) | `/login` → `POST /api/auth/login` with **`credentials: 'include'`** (Vite dev proxy keeps cookies same-site). Protected routes load catalog only after auth. **Do not embed secrets in `VITE_*` builds.** |

**Optional automation:** set `ADMIN_API_SECRET` and send header `x-admin-token` on admin catalog routes (CI/scripts). Human admins should use login + cookie.

### Stack hardening (Express)

| Layer | Behaviour |
| --- | --- |
| **Helmet** | Sets standard security-related HTTP headers (CSP omitted for plain JSON APIs; `Cross-Origin-Resource-Policy: cross-origin` so CORS fetches behave predictably). |
| **Timings — admin token** | `x-admin-token` is matched with **SHA-256 + `timingSafeEqual`** vs the configured secret hash so guesses do not leak token length hints. |
| **Rate limits** | Public catalog `GET`s, admin catalog (`GET`+`PUT`), and `POST /api/orders` each have configurable windows (`PUBLIC_CATALOG_RATE_LIMIT_MAX`, `ADMIN_CATALOG_RATE_LIMIT_MAX`, `ORDER_RATE_LIMIT_MAX`). Use **`TRUST_PROXY=1`** behind a trusted reverse proxy so limits key off real client IPs. |
| **Body size** | `express.json({ limit: CATALOG_JSON_LIMIT })` caps oversized payloads against memory abuse. |

## Environment knobs

See repository root `.env.example` for canonical env vars (`ADMIN_API_SECRET`, `CORS_ORIGINS`, Stripe publishable placeholders, rate limits, `TRUST_PROXY`, etc.).

