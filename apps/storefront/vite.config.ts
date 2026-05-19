import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    /** Storefront consumes public `/api/store/catalog` and never persists catalog blobs. */
    __ADMIN_BUILD__: false,
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.join(dir, 'src/app'),
      '@boutique/shared': path.resolve(dir, '../../packages/shared/src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
});
