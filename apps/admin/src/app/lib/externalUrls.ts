export function storefrontHref(path = '/') {
  const base =
    (import.meta.env.VITE_STORE_URL as string | undefined)?.trim().replace(/\/$/, '') ||
    'http://localhost:5173';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
