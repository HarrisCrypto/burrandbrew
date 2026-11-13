import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// Shared frontmatter for all editorial collections.
// Honesty gate (claim-firewall): no fabricated ratings, prices, testimonials,
// or customer counts anywhere. Reviews ship with status "in-progress" until a
// real hands-on evaluation exists.

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

const articleSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  updated: z.date().optional(),
  draft: z.boolean().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  faq: z.array(faqItem).optional(),
  // Set false on pages that should not be indexed (e.g. unfinished reviews)
  index: z.boolean().optional(),
});

const reviews = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/reviews' }),
  schema: articleSchema.extend({
    // Product being reviewed. Status stays "in-progress" until a genuine
    // hands-on evaluation is written — never invent a rating.
    product: z.string(),
    status: z.enum(['in-progress', 'published']).default('in-progress'),
  }),
});

const comparisons = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/comparisons' }),
  schema: articleSchema,
});

const guides = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/guides' }),
  schema: articleSchema,
});

const verticals = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/verticals' }),
  schema: articleSchema.extend({
    // e.g. "plumbers", "salons" — used for the /for/{vertical}/ route
    vertical: z.string(),
  }),
});

export const collections = {
  reviews,
  comparisons,
  guides,
  verticals,
};
