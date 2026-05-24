# Boutique monorepo

Admin panel + storefront for an ethnic couture store. Original Figma: [Admin panel for store](https://www.figma.com/design/WCIa5zha2OY84KgVFPgE7c/Admin-panel-for-store).

## Branch strategy

| Branch | Purpose |
| --- | --- |
| **`main`** | Production — deploy only tested, release-ready code here |
| **`development`** | Active development — day-to-day work, features, and fixes |

**Workflow:** develop on `development` → test locally → merge into `main` when ready to go live.

```bash
git checkout development    # daily work
git checkout main           # production deploys pull from here
```

## Local development

```bash
npm install

# One-time: copy env templates (gitignored locally)
copy .env.example .env
copy apps\storefront\.env.development.example apps\storefront\.env.development
copy apps\admin\.env.development.example apps\admin\.env.development

npm run dev
```

- Storefront: http://localhost:5173  
- Admin: http://localhost:5174  
- API: http://localhost:3001  

## Production deploy (`main` branch)

Ignored files (`dist/`, `.env`, `server/data/*.db`) are **not** in git on purpose — create them on the server during deploy.

### 1. API server

```bash
git clone <repo> && cd product && git checkout main
npm ci
copy .env.example .env   # edit with production secrets and CORS_ORIGINS
set NODE_ENV=production
npm run start:prod
```

On first boot the API creates `server/data/catalog.db` and seeds the admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.

### 2. Storefront & admin (static builds)

```bash
copy apps\storefront\.env.production.example apps\storefront\.env.production
copy apps\admin\.env.production.example apps\admin\.env.production
# Edit both files with your live API and site URLs, then:
npm run build:prod
```

Deploy `apps/storefront/dist` and `apps/admin/dist` to your static host (nginx, Vercel, Netlify, etc.). Point `VITE_API_URL` at your live API origin.

See `server/STORAGE.md` for auth, SQLite, and rate-limit details.
