import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    /** Admin loads full `/api/admin/catalog` and persists via `/api/admin/catalog`. */
    __ADMIN_BUILD__: true,
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
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
