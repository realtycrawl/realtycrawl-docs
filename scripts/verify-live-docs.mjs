import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('docs.json', 'utf8'));
const pages = new Set(['']);
function visit(value) {
  if (Array.isArray(value)) return value.forEach(visit);
  if (!value || typeof value !== 'object') return;
  for (const page of value.pages || []) pages.add(page);
  for (const [key, child] of Object.entries(value)) if (key !== 'pages') visit(child);
}
visit(config.navigation);
// Only public documentation GETs. No authentication or billable API operations.
const queue = [...pages];
await Promise.all(Array.from({ length: 3 }, async () => {
  while (queue.length) {
    const page = queue.shift();
    const response = await fetch(`https://realtycrawl.dev/docs/${page}`, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200, `${page}: HTTP ${response.status}`);
    const url = new URL(response.url);
    assert.equal(url.origin, 'https://realtycrawl.dev');
    assert(url.pathname === '/docs' || url.pathname.startsWith('/docs/'), `${page}: outside the documentation subpath`);
    const html = await response.text();
    const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
    assert(title?.includes('RealtyCrawl'), `${page}: missing RealtyCrawl title`);
    assert(!/not found|404/i.test(title), `${page}: not-found page`);
    console.log(`200 ${page || '/'} — ${title}`);
  }
}));
console.log(`Verified HTTPS and rendered pages for ${pages.size} public documentation routes.`);
