import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'data', 'catalog.db');

const giftSettings = {
  siteName: 'GiftJoy',
  storefrontTitle: 'Curated gifts for every moment',
  storefrontSubtitle:
    'Handpicked presents for birthdays, anniversaries, and celebrations—shop our own collection or discover partner picks via affiliate links.',
  footerText: '© 2026 GiftJoy. All rights reserved.',
  announcementBar:
    'Free gift wrap on orders $50+ • Curated affiliate picks • Same-day dispatch on in-stock items',
  theme: {
    primary: '#6B2D8C',
    accent: '#E8725C',
    surface: '#FEF7F3',
    bandDark: '#2D1B4E',
    pageBackground: '#ffffff',
    foreground: '#2D1B4E',
    border: 'rgba(45, 27, 78, 0.12)',
    radius: 'lg',
  },
  headerTagline: 'Thoughtful gifting',
  headerLogoGlyph: 'G',
  headerLogoUrl: '',
  footerBrandBlurb:
    'Curated gift ideas for every occasion. Mix in-house favourites with trusted partner picks—all in one place.',
  footerContactAddress: 'Serving gift lovers worldwide • GiftJoy HQ',
  footerContactEmail: 'hello@giftjoy.store',
};

const giftCategories = [
  {
    id: '1',
    name: 'For Her',
    description: 'Thoughtful gifts she will love',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=300&fit=crop',
    slug: 'for-her',
    sortOrder: 1,
    published: true,
  },
  {
    id: '2',
    name: 'For Him',
    description: 'Perfect picks for the special men in your life',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b923823cd?w=400&h=300&fit=crop',
    slug: 'for-him',
    sortOrder: 2,
    published: true,
  },
  {
    id: '3',
    name: 'Birthdays',
    description: 'Celebrate another year with the perfect present',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672f72a7a?w=400&h=300&fit=crop',
    slug: 'birthdays',
    sortOrder: 3,
    published: true,
  },
  {
    id: '4',
    name: 'Occasions',
    description: 'Anniversaries, weddings, and milestone moments',
    image: 'https://images.unsplash.com/photo-1512909006721-3d0158887362?w=400&h=300&fit=crop',
    slug: 'occasions',
    sortOrder: 4,
    published: true,
  },
  {
    id: '5',
    name: 'Under $50',
    description: 'Great gifts that will not break the bank',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b923823cd?w=400&h=300&fit=crop',
    slug: 'under-50',
    sortOrder: 5,
    published: true,
  },
  {
    id: '6',
    name: 'Partner Picks',
    description: 'Curated affiliate favourites from trusted stores',
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=300&fit=crop',
    slug: 'partner-picks',
    sortOrder: 6,
    published: true,
  },
];

const db = new Database(dbPath);
const row = db.prepare('SELECT json FROM catalog_snap WHERE id = 1').get();
if (!row?.json) {
  console.error('No catalog row found');
  process.exit(1);
}

const catalog = JSON.parse(row.json);
catalog.settings = { ...catalog.settings, ...giftSettings };
catalog.categories = giftCategories;

db.prepare(
  `INSERT OR REPLACE INTO catalog_snap (id, json, updated_at) VALUES (1, ?, datetime('now'))`,
).run(JSON.stringify(catalog));

console.log(`Patched ${dbPath}`);
console.log(`  siteName: ${catalog.settings.siteName}`);
console.log(`  theme.primary: ${catalog.settings.theme.primary}`);
console.log(`  categories: ${catalog.categories.map((c) => c.name).join(', ')}`);
db.close();
