// Single source of truth for breadcrumb labels per route. buildBreadcrumbList
// (seo.ts) reads this so every page emits a correct BreadcrumbList without
// hand-threading it through layouts.

export interface Crumb {
  label: string;
  href: string;
}

// Human labels for the first path segment. Extend as routes are added.
const SEGMENT_LABELS: Record<string, string> = {
  about: 'About',
  speaking: 'Speaking',
  podcast: 'Podcast',
  book: 'Book',
  contact: 'Contact',
};

/**
 * Build the breadcrumb trail for a pathname, always rooted at Home.
 * '/'            → [Home]
 * '/speaking/'   → [Home, Speaking]
 * Unknown segments are title-cased as a graceful fallback.
 */
export function breadcrumbsForPath(pathname: string): Crumb[] {
  const trail: Crumb[] = [{ label: 'Home', href: '/' }];
  const segments = pathname.split('/').filter(Boolean);
  let href = '';
  for (const segment of segments) {
    href += `/${segment}`;
    const label =
      SEGMENT_LABELS[segment] ??
      segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    trail.push({ label, href: `${href}/` });
  }
  return trail;
}
