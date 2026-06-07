import { breadcrumbsForPath } from './routes';

// Canonical host. PUBLIC_SITE_URL overrides at build time; the fallback is the
// production domain so a missing env var still ships correct canonicals + JSON-LD
// @id values + sitemap URLs.
const SITE_URL = import.meta.env.PUBLIC_SITE_URL ?? 'https://nickfischer.me';

export function abs(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// Brand suffix appended to <title> tags for SERP recognition.
const BRAND = 'Nick Fischer';

// Canonical socials / off-site profiles — drive Person.sameAs (the strongest
// entity-disambiguation signal for Google's Knowledge Graph + AI overviews).
const PERSON_SAME_AS = [
  'https://www.linkedin.com/in/nfischer83/',
  'https://x.com/nick_fisch_er',
  'https://www.instagram.com/nick.fisch.er',
  'https://www.facebook.com/nfischer83',
  'https://www.amazon.com/stores/Nick-Fischer/author/B09VPN4W6S',
  'https://www.wikidata.org/wiki/Q140087615',
  'https://www.crunchbase.com/person/nick-fischer-c93b',
  'https://chirobasix.com/about/nick-fischer/',
];

/**
 * Append the brand to a page <title>, e.g.
 *   "Speaking" → "Speaking - Nick Fischer".
 * Idempotent: titles that already contain the brand (home, the name itself)
 * are returned unchanged so we never double-suffix.
 */
export function withBrand(title: string): string {
  return title.toLowerCase().includes(BRAND.toLowerCase()) ? title : `${title} - ${BRAND}`;
}

/* ───────────────────────── Core entities ─────────────────────────
 * Each carries a stable @id so buildGraph() can de-duplicate them: the
 * Person, Organization, WebSite, Book, and PodcastSeries are defined once
 * and referenced by @id everywhere else.
 * ───────────────────────────────────────────────────────────────── */

export const PERSON_ID = abs('/#person');
export const ORG_ID = 'https://chirobasix.com/#organization';
export const WEBSITE_ID = abs('/#website');
export const BOOK_ID = abs('/book/#book');
export const PODCAST_ID = abs('/podcast/#podcast');

/** The central Person node — the entity the whole site is about. */
export function buildPerson() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Nick Fischer',
    givenName: 'Nick',
    familyName: 'Fischer',
    url: SITE_URL,
    image: {
      '@type': 'ImageObject',
      url: abs('/img/nick-fischer.jpg'),
      width: 1024,
      height: 1024,
      caption: 'Nick Fischer',
    },
    jobTitle: 'Founder & Chiropractic Marketing Consultant',
    description:
      'Founder of CHIROBASIX, chiropractic marketing consultant, author of The Chiropractor\'s Marketing Playbook, and host of the Chiropractic Practice Success podcast.',
    worksFor: { '@id': ORG_ID },
    founder: { '@id': ORG_ID },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'Grand Valley State University',
    },
    knowsAbout: [
      'Chiropractic Marketing',
      'Local SEO',
      'Answer Engine Optimization',
      'Paid Search & Social Advertising',
      'CRM Automation',
      'Patient Generation',
      'Practice Growth',
    ],
    knowsLanguage: 'en-US',
    // The page Google should treat as the entity's home (the bio/about page).
    mainEntityOfPage: abs('/about/'),
    // A third-party work about Nick — ties off-site corroboration into the graph.
    subjectOf: {
      '@type': 'PodcastEpisode',
      name: 'How to Grow Your Chiropractic Practice Using AI with Nick Fischer',
      url: 'https://myfivestar.com/podcast/how-to-grow-your-chiropractic-practice-using-ai-with-nick-fischer/',
      datePublished: '2025-07-30',
    },
    sameAs: PERSON_SAME_AS,
  };
}

/** CHIROBASIX — referenced as worksFor / founder / publisher. */
export function buildOrganization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'CHIROBASIX',
    url: 'https://chirobasix.com',
    logo: {
      '@type': 'ImageObject',
      url: abs('/img/chirobasix-logo.png'),
      width: 360,
      height: 68,
    },
    description:
      'A marketing agency built exclusively for chiropractors, helping practices grow with proven patient-generation systems.',
    founder: { '@id': PERSON_ID },
    sameAs: [
      'https://www.youtube.com/@CHIROBASIX',
      'https://www.wikidata.org/wiki/Q140087640',
    ],
  };
}

/** WebSite node — publisher is the Person; enables sitelinks + entity tie-in. */
export function buildWebSite() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE_URL,
    name: 'Nick Fischer',
    description:
      'The official site of Nick Fischer — chiropractic marketing consultant, author, podcast host, and speaker.',
    publisher: { '@id': PERSON_ID },
    inLanguage: 'en-US',
  };
}

/**
 * ProfilePage node — Google's recommended wrapper for a page that is *about a
 * person* (the home + about pages). Sets mainEntity to the Person.
 */
export function buildProfilePage(input: { url: string; name: string; description: string }) {
  return {
    '@type': 'ProfilePage',
    '@id': `${input.url}#profilepage`,
    url: input.url,
    name: input.name,
    description: input.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    mainEntity: { '@id': PERSON_ID },
    inLanguage: 'en-US',
  };
}

/** Generic WebPage node for non-profile pages (speaking, contact, etc.). */
export function buildWebPage(input: { url: string; name: string; description: string }) {
  return {
    '@type': 'WebPage',
    '@id': `${input.url}#webpage`,
    url: input.url,
    name: input.name,
    description: input.description,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': PERSON_ID },
    inLanguage: 'en-US',
  };
}

/** The book — authored by the Person. */
export function buildBook(input?: { url?: string }) {
  return {
    '@type': 'Book',
    '@id': BOOK_ID,
    name: "The Chiropractor's Marketing Playbook",
    author: { '@id': PERSON_ID },
    inLanguage: 'en-US',
    about: 'Chiropractic practice marketing and patient generation',
    isbn: '979-8419806924',
    bookFormat: 'https://schema.org/Paperback',
    url: input?.url ?? abs('/book/'),
    sameAs: [
      'https://www.amazon.com/dp/B09VFRYBT7',
      'https://www.wikidata.org/wiki/Q140087643',
    ],
  };
}

/** The podcast series — hosted/authored by the Person. */
export function buildPodcastSeries(input?: { url?: string }) {
  return {
    '@type': 'PodcastSeries',
    '@id': PODCAST_ID,
    // Canonical show name (matches Apple/Spotify/RSS); the descriptive long form
    // the site uses in copy is carried as alternateName.
    name: 'Chiropractic Practice Success',
    alternateName: 'The Chiropractic Practice Success Podcast',
    description:
      'A podcast for chiropractors who want to grow their practice — chiropractic marketing strategies, tactics, and programs that help top DCs build massively successful practices. Hosted by Nick Fischer.',
    url: input?.url ?? abs('/podcast/'),
    image: abs('/img/podcast-cover.jpg'),
    webFeed: 'https://media.rss.com/chiropractic-practice-success-chirobasix/feed.xml',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    inLanguage: 'en-US',
    genre: ['Business', 'Marketing', 'Entrepreneurship'],
    // Off-platform show pages — corroborate the podcast entity for the KG.
    sameAs: [
      'https://podcasts.apple.com/us/podcast/chiropractic-practice-success-chirobasix/id1578322060',
      'https://open.spotify.com/show/0iUxEZ3Sajsv8csLsHAD1x',
      'https://music.amazon.com/podcasts/chiropractic-practice-success',
      'https://www.wikidata.org/wiki/Q140087648',
    ],
  };
}

/**
 * Speaking page → ItemList of past/upcoming Event nodes. Pass real events when
 * known; omit (or pass []) and no list is emitted (never fabricate events).
 */
export interface SpeakingEvent {
  name: string;
  url?: string;
  startDate?: string; // ISO date
  location?: string;
}
export function buildSpeakerEvents(events: SpeakingEvent[]) {
  if (!events.length) return null;
  return {
    '@type': 'ItemList',
    name: 'Speaking engagements — Nick Fischer',
    itemListElement: events.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Event',
        name: e.name,
        ...(e.url && { url: e.url }),
        ...(e.startDate && { startDate: e.startDate }),
        ...(e.location && {
          location: { '@type': 'Place', name: e.location },
        }),
        performer: { '@id': PERSON_ID },
        organizer: { '@id': PERSON_ID },
      },
    })),
  };
}

/** FAQPage — rich results + AI answer-engine fodder. */
export function buildFaqPage(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return null;
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/**
 * BreadcrumbList for any non-home path. Auto-injected by BaseLayout so no page
 * has to thread it manually. Returns null on the home page (no breadcrumb).
 */
export function buildBreadcrumbList(pathname: string) {
  const crumbs = breadcrumbsForPath(pathname);
  if (!crumbs || crumbs.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      item: abs(c.href),
    })),
  };
}

/**
 * Compose nodes into ONE JSON-LD @graph: shared entities (Person, Organization,
 * WebSite) are de-duplicated by @id and each node's @context is hoisted onto
 * the single graph wrapper. This is the canonical, validator-friendly shape.
 */
export function buildGraph(nodes: object[]) {
  // De-dupe by @id (last write wins is fine — they're identical builders).
  const seen = new Map<string, object>();
  const anon: object[] = [];
  for (const node of nodes) {
    const id = (node as Record<string, unknown>)['@id'];
    if (typeof id === 'string') seen.set(id, node);
    else anon.push(node);
  }
  return {
    '@context': 'https://schema.org',
    '@graph': [...seen.values(), ...anon],
  };
}
