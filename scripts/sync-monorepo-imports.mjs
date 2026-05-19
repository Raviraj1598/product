import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const targets = ['apps/storefront/src', 'apps/admin/src'];

async function walk(dir, out = []) {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (/\.(tsx|ts)$/.test(e.name)) out.push(p);
  }
  return out;
}

function patch(content) {
  let s = content;
  /* Store provider & API state */
  s = s.replace(/from\s+['"]((?:\.\.\/)+)(?:src\/)?app\/hooks\/useLocalStorage['"]/g, "from '@boutique/shared'");
  s = s.replace(/from\s+['"]((?:\.\.\/)+)(?:src\/)?app\/context\/StoreContext['"]/g, "from '@boutique/shared'");
  s = s.replace(/from\s+['"]((?:\.\.\/)+)context\/StoreContext['"]/g, "from '@boutique/shared'");
  /* Types live in shared */
  s = s.replace(/from\s+['"]((?:\.\.\/)+)(?:src\/)?app\/types(\/index)?['"]/g, "from '@boutique/shared'");
  s = s.replace(/from\s+['"]((?:\.\.\/)+)types\/index['"]/g, "from '@boutique/shared'");
  s = s.replace(/from\s+['"]((?:\.\.\/)+)types['"]/g, "from '@boutique/shared'");
  return s;
}

for (const t of targets) {
  const base = path.join(root, t);
  const files = await walk(base);
  for (const f of files) {
    const before = await fs.readFile(f, 'utf8');
    const after = patch(before);
    if (after !== before) await fs.writeFile(f, after, 'utf8');
  }
}

console.log('OK: storefront + admin imports now use @boutique/shared where applicable');
