// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// Production canonical. PUBLIC_SITE_URL overrides at build time (preview
// branches, or once the final domain is confirmed); the fallback is the
// intended live domain so a missing env var still ships correct canonicals +
// JSON-LD @id values + sitemap URLs.
//
// INTERIM canonical: the Cloudflare Pages URL. nickfischer.com is NOT ours, so
// the live .pages.dev host is the canonical for now. Swap this one string (or
// set PUBLIC_SITE_URL in the deploy workflow) when a real owned domain is chosen.
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://nick-fischer.pages.dev';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    assets: 'astro-assets',
    // Inline page-level stylesheets so the first paint has no render-blocking
    // CSS request — saves a round-trip on cold mobile connections.
    inlineStylesheets: 'always',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith('/404/'),
    }),
    // Lucide icon set — rendered to inline SVG at build time (zero client JS).
    icon({ include: { lucide: ['*'] } }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
