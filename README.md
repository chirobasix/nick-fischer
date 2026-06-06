# Nick Fischer — Personal Brand Site

Astro v6 marketing site for **Nick Fischer** (digital marketer; founder of
CHIROBASIX; author of *The Chiropractor's Marketing Playbook*; host of *The
Chiropractic Practice Success Podcast*; speaker). Built for maximum SEO,
answer-engine visibility, and Core Web Vitals.

Same infrastructure as the CHIROBASIX site (Astro + Tailwind 4 + Cloudflare
Pages) but **zero client JS by default** and a **system-font stack** for
top-tier Lighthouse scores.

## Commands

- `npm install` — install dependencies
- `npm run dev` — local dev server
- `npm run build` — production build → `dist/`
- `npm run preview` — preview the build
- `npm test` — Vitest unit tests (SEO/schema helpers)
- `npx astro sync` — regenerate Astro types

## Stack

- **Astro v6** — static output, `trailingSlash: 'always'`, inlined stylesheets
- **Tailwind v4** via `@tailwindcss/vite` (design tokens in `src/styles/globals.css`)
- **@astrojs/sitemap** — `sitemap-index.xml`
- **astro-icon** + Lucide — icons rendered to inline SVG (no client JS)
- **Cloudflare Pages** — deploy via GitHub Actions (`.github/workflows/cf-pages-deploy.yml`)

## SEO architecture

All structured data is generated in `src/lib/seo.ts` and composed into a single
JSON-LD `@graph` per page by `BaseLayout.astro`:

- `Person` (the central entity) → `worksFor`/`founder` CHIROBASIX `Organization`
- `WebSite`, `ProfilePage` (home + about), `Book`, `PodcastSeries`
- `BreadcrumbList` auto-injected on every non-home page
- `FAQPage` + `Event`/`ItemList` (speaking) where data exists

`withBrand()` appends `" - Nick Fischer"` to `<title>` tags (idempotent).

## Deploying

Push to `main` → GitHub Actions builds and runs `wrangler pages deploy` to the
`nick-fischer` Cloudflare Pages project (auto-created on first deploy).

**Required repo secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## Domain

The canonical host is the live Cloudflare Pages URL (`https://nick-fischer.pages.dev`)
for now — `nickfischer.com` is not ours. To move to a real owned domain later, set
it in `astro.config.mjs`, `src/lib/seo.ts`, `src/layouts/BaseLayout.astro`, the
workflow's `PUBLIC_SITE_URL`, and `public/robots.txt` (or just set `PUBLIC_SITE_URL`).
