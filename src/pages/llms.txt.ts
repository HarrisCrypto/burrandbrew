import { getCollection } from 'astro:content';
import { SITE } from 'astrowind:config';

// Build-time llms.txt: a compact, crawler-friendly summary of the site,
// generated from the live content collections. Emitted as /llms.txt.
export const prerender = true;

const SITE_URL = (SITE?.site || 'https://example.com').replace(/\/$/, '');

export async function GET() {
  const collections = (
    await Promise.all(
      (['reviews', 'comparisons', 'guides', 'verticals'] as const).map((c) =>
        getCollection(c, ({ data }) => !data.draft).then((entries) => ({ name: c, entries }))
      )
    )
  ).filter((c) => c.entries.length > 0);

  const hrefFor = (collection: string, id: string, vertical?: string) => {
    const slug = id.replace(/\.mdx?$/, '');
    if (collection === 'verticals' && vertical) return `${SITE_URL}/for/${vertical}/`;
    return `${SITE_URL}/${collection}/${slug}/`;
  };

  const lines: string[] = [
    '# Burr & Brew',
    '',
    '> Independent buying guides, brewing how-tos, and gear comparisons for home coffee',
    '> and espresso. Technique-first, no sponsored rankings, no fake reviews.',
    '',
    '',
    '## About',
    '',
    '- Burr & Brew teaches home coffee technique before gear:',
    '  grind, ratio, and method fundamentals, then honest gear education.',
    '- This site covers home coffee honestly: no sponsored rankings,',
    '  no invented ratings or prices.',
    '- Affiliate disclosure: some links earn us a commission at no extra cost to the reader.',
    `  Full disclosure: ${SITE_URL}/affiliate-disclosure/`,
    '',
    '## Key pages',
    '',
    `- Home: ${SITE_URL}/`,
    `- Reviews: ${SITE_URL}/reviews/`,
    `- Comparisons: ${SITE_URL}/comparisons/`,
    `- Buyer guides: ${SITE_URL}/guides/`,
    `- About: ${SITE_URL}/about/`,
    '',
  ];

  for (const { name, entries } of collections) {
    lines.push(`## ${name[0].toUpperCase()}${name.slice(1)}`, '');
    for (const e of entries) {
      const url = hrefFor(name, e.id, (e.data as any).vertical);
      lines.push(`- [${e.data.title}](${url}): ${e.data.description}`);
    }
    lines.push('');
  }

  lines.push('## Contact', '', '- Corrections welcome via the About page.', '');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
