import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(serverDir, '..');

/** Load `.env` from monorepo root (works regardless of process cwd). */
export function loadEnv(): void {
  const envPath = path.join(repoRoot, '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    return;
  }
  dotenv.config();
}
