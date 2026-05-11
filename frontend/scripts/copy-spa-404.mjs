import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '..', 'dist');
const indexHtml = path.join(distDir, 'index.html');
const notFoundHtml = path.join(distDir, '404.html');

if (!fs.existsSync(indexHtml)) {
  console.warn('[copy-spa-404] dist/index.html missing; skip.');
  process.exit(0);
}

fs.copyFileSync(indexHtml, notFoundHtml);
console.log('[copy-spa-404] Wrote 404.html (SPA fallback for static hosts).');
