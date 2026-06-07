// Build-time podcast feed reader. Pulls the latest episodes from the RSS feed so
// the /podcast/ page lists fresh episodes without any client JS. Fetched once per
// build; a weekly scheduled deploy (see cf-pages-deploy.yml) keeps it current.
// Fails soft — on any error it returns [] and the page just shows subscribe links.

const FEED_URL =
  'https://media.rss.com/chiropractic-practice-success-chirobasix/feed.xml';

export interface Episode {
  title: string;
  link: string;
  pubDate: string; // ISO 8601, or '' if unparseable
  durationSec: number | null;
  description: string; // plain text, trimmed to ~180 chars
  guid: string;
}

const stripCdata = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

const stripHtml = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

function tag(item: string, name: string): string | null {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? stripCdata(m[1]).trim() : null;
}

export async function getEpisodes(limit = 6): Promise<Episode[]> {
  try {
    const res = await fetch(FEED_URL);
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map((m) => m[1])
      .slice(0, limit);

    return items.map((item) => {
      const link = tag(item, 'link') ?? '';
      const pub = tag(item, 'pubDate');
      const dur = tag(item, 'itunes:duration');
      const desc = stripHtml(tag(item, 'description') ?? '');
      let iso = '';
      if (pub) {
        const d = new Date(pub);
        if (!Number.isNaN(d.getTime())) iso = d.toISOString();
      }
      return {
        title: tag(item, 'title') ?? 'Untitled episode',
        link,
        pubDate: iso,
        durationSec: dur && /^\d+$/.test(dur) ? parseInt(dur, 10) : null,
        description: desc.length > 180 ? `${desc.slice(0, 177).trimEnd()}…` : desc,
        guid: tag(item, 'guid') ?? link,
      };
    });
  } catch {
    return [];
  }
}

/** Seconds → "37 min" (or "1h 02m" for long ones). */
export function fmtDuration(sec: number | null): string | null {
  if (!sec) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m} min`;
}
