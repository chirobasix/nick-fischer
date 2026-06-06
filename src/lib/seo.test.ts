import { describe, it, expect } from 'vitest';
import {
  withBrand,
  abs,
  buildPerson,
  buildOrganization,
  buildGraph,
  buildBreadcrumbList,
  buildProfilePage,
  buildSpeakerEvents,
  buildFaqPage,
  PERSON_ID,
  ORG_ID,
} from './seo';
import { breadcrumbsForPath } from './routes';

describe('withBrand', () => {
  it('appends the brand suffix', () => {
    expect(withBrand('Speaking')).toBe('Speaking - Nick Fischer');
  });
  it('is idempotent when the brand is already present', () => {
    expect(withBrand('Nick Fischer')).toBe('Nick Fischer');
    expect(withBrand('Speaking - Nick Fischer')).toBe('Speaking - Nick Fischer');
  });
  it('matches case-insensitively', () => {
    expect(withBrand('about nick fischer')).toBe('about nick fischer');
  });
});

describe('abs', () => {
  it('produces absolute URLs with a trailing path', () => {
    expect(abs('/book/')).toBe('https://nickfischer.com/book/');
  });
});

describe('buildPerson', () => {
  it('is the central Person entity with a stable @id', () => {
    const p = buildPerson() as Record<string, any>;
    expect(p['@type']).toBe('Person');
    expect(p['@id']).toBe(PERSON_ID);
    expect(p.name).toBe('Nick Fischer');
    expect(p.worksFor['@id']).toBe(ORG_ID);
    expect(Array.isArray(p.sameAs)).toBe(true);
    expect(p.sameAs.length).toBeGreaterThan(0);
  });
});

describe('buildOrganization', () => {
  it('references CHIROBASIX and links back to the Person founder', () => {
    const o = buildOrganization() as Record<string, any>;
    expect(o.name).toBe('CHIROBASIX');
    expect(o['@id']).toBe(ORG_ID);
    expect(o.founder['@id']).toBe(PERSON_ID);
  });
});

describe('buildGraph', () => {
  it('hoists @context and de-duplicates nodes by @id', () => {
    const graph = buildGraph([
      buildPerson(),
      buildOrganization(),
      buildPerson(), // duplicate by @id
    ]) as Record<string, any>;
    expect(graph['@context']).toBe('https://schema.org');
    const ids = graph['@graph'].map((n: any) => n['@id']);
    // Person should appear exactly once despite being passed twice.
    expect(ids.filter((id: string) => id === PERSON_ID)).toHaveLength(1);
  });

  it('keeps anonymous (id-less) nodes such as BreadcrumbList', () => {
    const crumb = buildBreadcrumbList('/speaking/');
    const graph = buildGraph([buildPerson(), crumb!]) as Record<string, any>;
    const types = graph['@graph'].map((n: any) => n['@type']);
    expect(types).toContain('BreadcrumbList');
  });
});

describe('breadcrumbsForPath', () => {
  it('roots every trail at Home', () => {
    expect(breadcrumbsForPath('/')).toEqual([{ label: 'Home', href: '/' }]);
  });
  it('builds a labelled trail for known routes', () => {
    expect(breadcrumbsForPath('/speaking/')).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Speaking', href: '/speaking/' },
    ]);
  });
  it('title-cases unknown segments as a fallback', () => {
    const trail = breadcrumbsForPath('/media-kit/');
    expect(trail[1].label).toBe('Media Kit');
  });
});

describe('buildBreadcrumbList', () => {
  it('returns null for the home page', () => {
    expect(buildBreadcrumbList('/')).toBeNull();
  });
  it('emits positioned ListItems with absolute URLs', () => {
    const bc = buildBreadcrumbList('/podcast/') as Record<string, any>;
    expect(bc['@type']).toBe('BreadcrumbList');
    expect(bc.itemListElement[0].item).toBe('https://nickfischer.com/');
    expect(bc.itemListElement[1].item).toBe('https://nickfischer.com/podcast/');
  });
});

describe('buildProfilePage', () => {
  it('sets mainEntity to the Person', () => {
    const pp = buildProfilePage({
      url: abs('/about/'),
      name: 'About Nick Fischer',
      description: 'Bio',
    }) as Record<string, any>;
    expect(pp['@type']).toBe('ProfilePage');
    expect(pp.mainEntity['@id']).toBe(PERSON_ID);
  });
});

describe('buildSpeakerEvents', () => {
  it('returns null when there are no events (never fabricate)', () => {
    expect(buildSpeakerEvents([])).toBeNull();
  });
  it('builds a positioned ItemList of Events', () => {
    const list = buildSpeakerEvents([
      { name: 'Chiro Summit', startDate: '2026-09-01', location: 'Orlando, FL' },
    ]) as Record<string, any>;
    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement[0].item['@type']).toBe('Event');
    expect(list.itemListElement[0].item.performer['@id']).toBe(PERSON_ID);
  });
});

describe('buildFaqPage', () => {
  it('returns null with no FAQs', () => {
    expect(buildFaqPage([])).toBeNull();
  });
  it('maps Q&As to Question/Answer nodes', () => {
    const faq = buildFaqPage([{ question: 'Q?', answer: 'A.' }]) as Record<string, any>;
    expect(faq['@type']).toBe('FAQPage');
    expect(faq.mainEntity[0].acceptedAnswer.text).toBe('A.');
  });
});
