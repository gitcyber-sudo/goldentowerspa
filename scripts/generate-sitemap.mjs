/**
 * Sitemap Auto-Generator
 * Automatically discovers public routes from App.tsx and generates dist/sitemap.xml.
 * Excludes protected routes (ProtectedRoute), login pages, and admin/dashboard routes.
 * No dependencies required — uses Node built-ins only.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const SITE_URL = 'https://goldentowerspa.vercel.app';
const OUTPUT_DIR = resolve(ROOT, 'dist');
const APP_FILE = resolve(ROOT, 'src', 'App.tsx');
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// ── Keywords that mark a route as private (excluded from sitemap) ──
const EXCLUDE_KEYWORDS = ['login', 'admin', 'dashboard', 'therapist'];

// ── Priority & changefreq rules ──
function getRouteConfig(path) {
    if (path === '/') return { priority: '1.0', changefreq: 'weekly' };
    if (path === '/services') return { priority: '0.9', changefreq: 'weekly' };
    if (path === '/about') return { priority: '0.8', changefreq: 'monthly' };
    if (path === '/availability') return { priority: '0.6', changefreq: 'daily' };
    // Default for legal pages and anything else
    if (path.includes('privacy') || path.includes('terms')) {
        return { priority: '0.3', changefreq: 'monthly' };
    }
    return { priority: '0.5', changefreq: 'monthly' };
}

// ── Parse App.tsx to discover routes ──
const appSource = readFileSync(APP_FILE, 'utf-8');

// Extract all <Route path="..." blocks with their surrounding context
// We look for lines/blocks containing ProtectedRoute to identify private routes
const routeBlocks = appSource.split(/(?=<Route\b)/g).filter(b => b.startsWith('<Route'));

const publicPaths = [];

for (const block of routeBlocks) {
    // Extract the path attribute
    const pathMatch = block.match(/path=["']([^"']+)["']/);
    if (!pathMatch) continue;

    const routePath = pathMatch[1];

    // Skip if route contains ProtectedRoute wrapper
    if (block.includes('ProtectedRoute')) continue;

    // Skip if path matches any exclusion keyword
    if (EXCLUDE_KEYWORDS.some(kw => routePath.toLowerCase().includes(kw))) continue;

    publicPaths.push(routePath);
}

if (publicPaths.length === 0) {
    console.error('❌ No public routes found in App.tsx — sitemap not generated.');
    process.exit(1);
}

// ── Generate XML ──
const urls = publicPaths
    .map((p) => {
        const { priority, changefreq } = getRouteConfig(p);
        return `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

// ── Write to dist/ ──
if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
}

const outputPath = resolve(OUTPUT_DIR, 'sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf-8');

console.log(`✅ Sitemap generated → ${outputPath}`);
console.log(`   Routes discovered: ${publicPaths.join(', ')}`);
console.log(`   Total: ${publicPaths.length} URLs | lastmod: ${today}`);
