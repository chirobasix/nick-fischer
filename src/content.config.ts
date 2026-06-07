import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Thought-leadership essays. Drop Markdown files into src/content/insights/.
// Files starting with "_" are ignored (e.g. _template.md). Set `draft: true`
// in a post's frontmatter to keep it out of the build until it's ready.
const insights = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { insights };
