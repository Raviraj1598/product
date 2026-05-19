/** Admin app origin when it runs separately (see `npm run dev:admin`, default http://localhost:5174). */
export function adminSiteHref(path = '/') {
  const base =
    (import.meta.env.VITE_ADMIN_URL as string | undefined)?.trim().replace(/\/$/, '') ||
    'http://localhost:5174';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
