/// <reference types="vite/client" />

declare const __ADMIN_BUILD__: boolean;

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_ADMIN_API_TOKEN?: string;
  readonly VITE_ADMIN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
