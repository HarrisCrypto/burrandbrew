import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { visit, SKIP } from 'unist-util-visit';
import type { RemarkPlugin } from '@astrojs/markdown-remark';

// Resolves `[AFFILIATE:key]` tokens in article markdown through
// src/data/affiliate-links.json:
// - url set  → rendered as a styled affiliate CTA link
//             (rel="sponsored nofollow noopener", target="_blank")
// - url null → token is silently dropped so nothing placeholder-y ships
// Unknown keys are also dropped (fail closed, never render raw tokens).

interface AffiliateEntry {
  name: string;
  url: string | null;
}

function loadAffiliateMap(): Record<string, AffiliateEntry> {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(here, '..', 'data', 'affiliate-links.json'), 'utf-8');
    // Strip // comment lines (JSONC) before parsing.
    const json = raw
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    return JSON.parse(json) as Record<string, AffiliateEntry>;
  } catch {
    return {};
  }
}

const TOKEN_RE = /\[AFFILIATE:([a-z0-9-]+)\]/g;

function tokenToHtml(key: string, map: Record<string, AffiliateEntry>): string {
  const entry = map[key];
  if (entry && entry.url) {
    const href = entry.url.replace(/"/g, '&quot;');
    return `<a href="${href}" rel="sponsored nofollow noopener" target="_blank" class="affiliate-cta">Try ${entry.name}</a>`;
  }
  return '';
}

export const affiliateLinksRemarkPlugin: RemarkPlugin = () => {
  const map = loadAffiliateMap();

  return function (tree) {
    visit(tree, 'text', (node: any, index: number | undefined, parent: any) => {
      if (typeof index === 'undefined' || !parent || typeof node.value !== 'string') return;
      const value: string = node.value;
      if (!value.includes('[AFFILIATE:')) return;

      const parts: any[] = [];
      let last = 0;
      let match: RegExpExecArray | null;
      TOKEN_RE.lastIndex = 0;

      while ((match = TOKEN_RE.exec(value)) !== null) {
        const [token, key] = match;
        if (match.index > last) {
          parts.push({ type: 'text', value: value.slice(last, match.index) });
        }
        const entry = map[key];
        if (entry && entry.url) {
          parts.push({
            type: 'link',
            url: entry.url,
            data: {
              hName: 'a',
              hProperties: {
                href: entry.url,
                rel: 'sponsored nofollow noopener',
                target: '_blank',
                className: ['affiliate-cta'],
              },
            },
            children: [{ type: 'text', value: `Try ${entry.name}` }],
          });
        }
        // url null or unknown key → drop the token silently
        last = match.index + token.length;
      }

      if (last < value.length) {
        parts.push({ type: 'text', value: value.slice(last) });
      }

      parent.children.splice(index, 1, ...parts);
      return [SKIP, index + parts.length];
    });

    // Tokens inside raw HTML blocks (e.g. hand-written <table>s) arrive as
    // `html` nodes rather than text — rewrite them in place as HTML.
    visit(tree, 'html', (node: any) => {
      if (typeof node.value !== 'string' || !node.value.includes('[AFFILIATE:')) return;
      TOKEN_RE.lastIndex = 0;
      node.value = node.value.replace(TOKEN_RE, (_m: string, key: string) => tokenToHtml(key, map));
    });
  };
};
