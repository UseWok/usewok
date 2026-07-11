import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

async function crawl(url, timeoutMs = 8000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'follow',
    });
    if (!res.ok) return { html: null, status: res.status };
    return { html: await res.text(), status: res.status };
  } catch {
    return { html: null, status: 0 };
  }
}

function htmlToText(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categorize(path) {
  if (/legal|mentions|privacy|confidentialite|terms|cgu|cgv|cookies/i.test(path)) return 'Legal';
  if (/blog|article|news|actualite/i.test(path)) return 'Blog';
  if (/contact/i.test(path)) return 'Contact';
  if (/carriere|career|job|recrutement/i.test(path)) return 'Careers';
  if (/pricing|tarif/i.test(path)) return 'Pricing';
  if (/about|propos|equipe|team/i.test(path)) return 'About';
  if (/product|produit|service|feature|solution/i.test(path)) return 'Product';
  if (/faq|aide|help|support/i.test(path)) return 'FAQ / Help';
  return 'Page';
}

const UTILITY_RE = /login|register|signin|signup|logout|cart|panier|checkout|account|admin|wp-|\.(pdf|xml|jpg|jpeg|png|svg|zip|ico)$|unsubscribe|reset-password|forgot/i;
const LANG_DUP_RE = /^\/(fr|de|es|it|pt|nl|ja|zh)(\/|$)/i;
const SINGLE_CATS = ['Legal', 'Careers', 'Contact'];
const MAX_PAGES = 6;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const rawUrl = body.url || '';
    if (!rawUrl) return Response.json({ error: 'URL required' }, { status: 400 });
    const cleanUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    let origin = '';
    try { origin = new URL(cleanUrl).origin; } catch { return Response.json({ error: 'Invalid URL' }, { status: 400 }); }

    // ── 1. Crawl home + discover pages ──
    const home = await crawl(cleanUrl);
    const hrefs = [...(home.html || '').matchAll(/href=["']([^"'#?]+)["']/gi)].map(m => m[1]);
    const seen = new Set();
    const candidates = [];
    for (const h of hrefs) {
      try {
        const abs = new URL(h, cleanUrl);
        if (abs.origin !== origin) continue;
        const path = abs.pathname.replace(/\/$/, '') || '/';
        if (path === '/' || seen.has(path)) continue;
        seen.add(path);
        candidates.push({ url: origin + path, path });
      } catch {}
    }

    // ── 2. Filter & categorize ──
    const filtered = [];
    const catCount = {};
    const selected = [{ url: cleanUrl, category: 'Home' }];
    for (const c of candidates) {
      if (selected.length >= MAX_PAGES) break;
      if (UTILITY_RE.test(c.path)) { filtered.push({ url: c.url, reason: 'Utility page' }); continue; }
      if (LANG_DUP_RE.test(c.path)) { filtered.push({ url: c.url, reason: 'Language duplicate' }); continue; }
      const cat = categorize(c.path);
      if (SINGLE_CATS.includes(cat) && (catCount[cat] || 0) >= 1) { filtered.push({ url: c.url, reason: `Category limit (${cat})` }); continue; }
      catCount[cat] = (catCount[cat] || 0) + 1;
      selected.push({ url: c.url, category: cat });
    }

    // ── 3. Crawl selected pages in parallel ──
    const results = await Promise.all(selected.map(async (s, i) => {
      if (i === 0) return { ...s, text: htmlToText(home.html), fetched: !!home.html };
      const r = await crawl(s.url, 6000);
      return { ...s, text: htmlToText(r.html), fetched: !!r.html };
    }));
    const fetchedPages = results.filter(p => p.fetched && p.text.length > 100);
    const corpus = fetchedPages.map(p => `--- PAGE: ${p.url} (${p.category}) ---\n${p.text.slice(0, 3200)}`).join('\n\n') || '(no accessible page)';

    const agentSchema = {
      type: 'object',
      properties: {
        score: { type: 'number' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              page: { type: 'string' },
              title: { type: 'string' },
              detail: { type: 'string' },
              severity: { type: 'string' },
            },
          },
        },
      },
    };

    // AEO-only rules: focus on Answer Engine Optimization, zero SEO jargon.
    // Only return HIGH and MEDIUM severity items — skip trivial/low issues.
    // Each finding must be actionable and impactful for AI visibility.
    const baseRules = `Respond in English. You are evaluating AEO (Answer Engine Optimization) — can AI engines like ChatGPT, Gemini and Claude read this site and recommend it?
score = realistic 0-100 (empty/inaccessible site = 0-20).
items = 2-5 findings ONLY. Each must be a MEANINGFUL problem that directly hurts AI visibility — NOT minor or trivial issues.
Skip low-priority nitpicks. Only report problems that genuinely cost the business AI recommendations.
Each item: page (which page), title (the problem in plain English, no jargon), detail (one sentence explaining the impact), severity: "high" or "medium" only.
Never use SEO jargon like "robots.txt", "crawlers", "indexed pages", "meta tags", "canonical", "schema markup".
Speak in plain business English a non-technical owner understands. Valid JSON only.`;

    // ── 4. Run 2 AEO agents in parallel ──
    const [readability, clarity] = await Promise.all([
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are the AI READABILITY agent of an AEO audit of the site ${cleanUrl}.
Evaluate: Can AI engines read and understand this site? Check if the site structure is clear, if pages load and are accessible, if the main offer is obvious within seconds, and if an AI could extract the business name, what they do, and who they serve.
Focus only on problems that block AI comprehension — not minor code issues.\n\n${corpus}\n\n${baseRules}`,
        model: 'gemini_3_flash',
        response_json_schema: agentSchema,
      }).catch(() => null),
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are the CONTENT CLARITY agent of an AEO audit of the site ${cleanUrl}.
Evaluate: Does the content clearly answer what prospects ask? Check if the value proposition is crystal clear, if the content directly answers common buyer questions, if there's enough depth for an AI to cite this site as a source, and if the messaging is specific (not vague marketing speak).
Focus only on problems that make AIs skip or ignore this site — not minor wording tweaks.\n\n${corpus}\n\n${baseRules}`,
        model: 'gemini_3_flash',
        response_json_schema: agentSchema,
      }).catch(() => null),
    ]);

    const scores = [readability, clarity].filter(a => a && typeof a.score === 'number').map(a => a.score);
    const scoreWebsite = fetchedPages.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / (scores.length || 1));

    const record = await base44.asServiceRole.entities.SiteAudit.create({
      user_id: user.id,
      site_url: cleanUrl,
      status: 'done',
      score_website: scoreWebsite,
      pages_analyzed: fetchedPages.length,
      agents_json: JSON.stringify({
        crawl: home.html ? 'done' : 'failed',
        readability: readability ? 'done' : 'pending',
        clarity: clarity ? 'done' : 'pending',
      }),
      pages_json: JSON.stringify({
        discovered: candidates.length + 1,
        selected: selected.map(s => ({ url: s.url, category: s.category, fetched: results.find(r => r.url === s.url)?.fetched || false })),
        filtered,
        fetched: fetchedPages.length,
        category_limit_hits: 0,
      }),
      results_json: JSON.stringify({ readability, clarity }),
    });

    return Response.json(record);
  } catch (error) {
    console.error('[siteAudit]', error);
    return Response.json({ error: error?.message || 'Audit failed' }, { status: 500 });
  }
});