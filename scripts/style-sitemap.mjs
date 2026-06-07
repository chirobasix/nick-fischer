// Post-build: inject an XSL stylesheet reference into every generated sitemap so
// browsers render it as a styled HTML page (see public/sitemap.xsl).
// @astrojs/sitemap doesn't emit the processing instruction itself. Search engines
// ignore the stylesheet and read the raw XML, so this is purely human-facing.
//
// Runs after `astro build` (see package.json "build"). Idempotent.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const PI = '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>';

const entries = await readdir(DIST);
const sitemaps = entries.filter((f) => /^sitemap.*\.xml$/.test(f));

let styled = 0;
for (const file of sitemaps) {
  const path = join(DIST, file);
  const xml = await readFile(path, 'utf8');
  if (xml.includes('sitemap.xsl')) continue; // already styled
  const next = xml.replace(/(<\?xml[^>]*\?>)/, `$1\n${PI}`);
  if (next === xml) {
    console.warn(`[style-sitemap] no XML declaration found in ${file}, skipped`);
    continue;
  }
  await writeFile(path, next);
  styled++;
}

console.log(`[style-sitemap] styled ${styled}/${sitemaps.length} sitemap file(s): ${sitemaps.join(', ') || '(none)'}`);
