# Nick Fischer Personal Site — Claude Context

Astro v6 personal-brand site for **Nick Fischer** — digital marketer, founder of
the chiropractic marketing agency **CHIROBASIX**, author of *The Chiropractor's
Marketing Playbook*, host of *The Chiropractic Practice Success Podcast*, and
national speaker. Deployed on **Cloudflare Pages**. North-star goal: own the
"Nick Fischer" entity in Google + AI answer engines and rank for his authority
topics (chiropractic marketing, practice growth, speaking).

> Auto-loaded into every Claude session. Keep conventions here. **Never commit
> secrets** — use environment variables / repo secrets.

## Git workflow

`main` **auto-deploys to production** on Cloudflare (`.github/workflows/cf-pages-deploy.yml`,
on push to `main`). So:

- Branch from latest `main`, push the branch, open a PR. Don't commit to `main`
  directly once the deploy secrets are live.
- One branch per task, named `claude/<short-topic>`.
- No CI gates the PR — validate locally: `npx astro sync && npm test && npm run build`.

## Commands

- `npm run dev` — dev server
- `npm run build` — production build → `dist/`
- `npm test` — Vitest (SEO/schema helpers)
- `npx astro sync` — regenerate Astro content/types

## Architecture

- **Zero client JS by default.** The only inline (`is:inline`) scripts are: the
  nav toggle (pure CSS checkbox), a reveal-on-scroll IntersectionObserver in
  `BaseLayout.astro`, a click-to-load YouTube facade on `speaking.astro` (the
  iframe is only created on click), and a `window.print()` button on
  `speaker-kit.astro`. No React/Partytown/analytics/bundled JS — keep it that way
  for perfect Lighthouse/CWV unless there's a strong reason.
- **Podcast episodes** are pulled from the RSS feed at **build time**
  (`src/lib/podcast.ts`, used by `podcast.astro`) — no client JS. A weekly
  `schedule` cron in the deploy workflow rebuilds so new episodes appear.
- **System-font stack** (no web fonts) — instant text paint, no swap CLS. Tokens
  in `src/styles/globals.css` (`--font-display` / `--font-body`). Swap to a
  self-hosted face via `@font-face` if a distinct display type is wanted.
- **Pages** live in `src/pages/*.astro`. The **`insights` blog** uses a content
  collection (`src/content.config.ts`, Markdown in `src/content/insights/`,
  rendered by `src/pages/insights/index.astro` + `[...slug].astro`). Post body
  uses Tailwind's `prose` class; `draft: true` hides a post; `_`-prefixed files
  (e.g. `_template.md`) are ignored.
- **Layouts:** `BaseLayout.astro` (the `<head>` + JSON-LD graph + doc shell) →
  `PageLayout.astro` (Nav + `<main>` + Footer).

## SEO conventions (IMPORTANT)

- All structured data is built in `src/lib/seo.ts` and merged into ONE JSON-LD
  `@graph` per page by `BaseLayout` (`buildGraph` de-dupes by `@id`).
- Central entity: **`Person` (`/#person`)** → `worksFor`/`founder` the CHIROBASIX
  **`Organization`** (`https://chirobasix.com/#organization`). Also `WebSite`,
  `ProfilePage` (home + about), `Book` (`/book/#book`), `PodcastSeries`
  (`/podcast/#podcast`), `FAQPage`, and `Event`/`ItemList` (speaking).
- **`<title>` = `withBrand(title)`** → appends `" - Nick Fischer"` (idempotent).
- **Length targets:** title ≤ 60 chars incl. brand; meta description 140–160.
  Lead with the primary keyword.
- `Person.sameAs` (LinkedIn / X / CHIROBASIX profile) is the strongest
  entity-disambiguation signal — keep it accurate and expand it as profiles are
  added.
- **Never fabricate** events, reviews, ratings, or episode/book purchase data.
  Builders return `null`/omit when data is absent (see `buildSpeakerEvents`).

## Facts (source of truth for copy)

- Role: Founder & Chiropractic Marketing Consultant.
- 10+ years marketing experience; marketing degree, Grand Valley State University.
- Started building websites for local businesses in college; led marketing teams
  before founding CHIROBASIX.
- Tagline: "Helping chiropractors across the country dominate online so they can
  help more patients."
- Philosophy: "Marketing is a system, not a campaign."
- Socials: LinkedIn `nfischer83`, X `@nick_fisch_er`. Agency: chirobasix.com.

## Domain

Production domain is **`https://nickfischer.me`** (custom domain on the Cloudflare
Pages project `nick-fischer`). It's set as `PUBLIC_SITE_URL` in the deploy workflow
and as the fallback in `astro.config.mjs` + `src/lib/seo.ts` +
`src/layouts/BaseLayout.astro` + `public/robots.txt` + `public/llms.txt`, with
matching assertions in `src/lib/seo.test.ts`. A Pages Function
(`functions/_middleware.js`) 301-redirects the production `nick-fischer.pages.dev`
alias to `nickfischer.me` so there's a single canonical home (preview hash URLs
pass through). This is edge-side — still zero client JS, and `_headers`/`_redirects`
stay intact (unlike an advanced-mode `_worker.js`).

## Cloudflare deploy

Direct-upload Pages project `nick-fischer` (auto-created on first deploy).
**Required repo secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
(reuse the CHIROBASIX values). After merge the deploy takes ~1–2 min.

## TODO / not yet done

- Add real OG image at `public/img/og-default.png` (1200×630) + portrait
  `public/img/nick-fischer.jpg` (referenced by `Person.image`).
- Add `apple-touch-icon.png` (180×180) to `/public`.
- Wire real podcast subscribe links, book purchase link, and speaking events.
- Confirm final domain and flip the placeholder.
