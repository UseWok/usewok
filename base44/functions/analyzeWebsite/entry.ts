import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── User-Agent pool — rotate to avoid blocks ──────────────────────────────────
const USER_AGENTS = [
  // Googlebot — most sites whitelist it explicitly
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  // Chrome on Windows — looks like a real user
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  // Chrome on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
  // Safari on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
  // SemrushBot — whitelisted by most SEO-savvy sites
  'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
  // AhrefsBot — also widely whitelisted
  'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
];

function pickUserAgent(attempt = 0) {
  return USER_AGENTS[attempt % USER_AGENTS.length];
}

// Realistic browser headers that bypass most WAFs
function buildHeaders(ua, referer = '') {
  const isGooglebot = ua.includes('Googlebot');
  const isSeoBot = ua.includes('SemrushBot') || ua.includes('AhrefsBot');

  if (isGooglebot || isSeoBot) {
    // Bots are identified clearly — no fake browser headers needed
    return { 'User-Agent': ua, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' };
  }

  return {
    'User-Agent': ua,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': referer ? 'same-origin' : 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    ...(referer ? { 'Referer': referer } : {}),
  };
}

// Small random delay to look less like a bot
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Real HTML crawler with retry + UA rotation ────────────────────────────────
async function crawlPage(url, timeoutMs = 10000) {
  const strategies = [
    // 1. Googlebot — most sites whitelist this
    { ua: USER_AGENTS[0], referer: '' },
    // 2. Chrome user — looks human
    { ua: USER_AGENTS[1], referer: 'https://www.google.com/' },
    // 3. SemrushBot — SEO-savvy sites allow it
    { ua: USER_AGENTS[5], referer: '' },
    // 4. Firefox user — different fingerprint
    { ua: USER_AGENTS[3], referer: 'https://www.google.fr/' },
  ];

  for (let i = 0; i < strategies.length; i++) {
    const { ua, referer } = strategies[i];
    try {
      if (i > 0) await sleep(300 + Math.random() * 400); // small delay between retries

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: buildHeaders(ua, referer),
        redirect: 'follow',
      });
      clearTimeout(timer);

      // 403/429/503 = blocked, try next UA
      if (res.status === 403 || res.status === 429 || res.status === 503) {
        console.log(`[crawlPage] Blocked (${res.status}) with UA[${i}] on ${url}, trying next...`);
        continue;
      }

      if (!res.ok) return null;

      const html = await res.text();

      // Detect Cloudflare / bot challenge pages
      if (html.includes('cf-browser-verification') || html.includes('__cf_chl') || html.includes('Enable JavaScript') && html.length < 5000) {
        console.log(`[crawlPage] Cloudflare challenge detected with UA[${i}] on ${url}, trying next...`);
        continue;
      }

      console.log(`[crawlPage] Success with UA[${i}] (${ua.slice(0, 40)}...) on ${url}`);
      return html;
    } catch (e) {
      console.log(`[crawlPage] Error with UA[${i}] on ${url}: ${e.message}`);
    }
  }

  console.log(`[crawlPage] All strategies failed for ${url}`);
  return null;
}

// ── Extract key technical signals from raw HTML ───────────────────────────────
function extractSignals(html, url) {
  if (!html) return {};

  const lower = html.toLowerCase();

  // Schema.org JSON-LD blocks
  const jsonLdBlocks = [];
  const jsonLdRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = jsonLdRe.exec(html)) !== null) {
    try { jsonLdBlocks.push(JSON.parse(m[1])); } catch {}
  }

  const schemaTypes = jsonLdBlocks.map(b => (b['@type'] || '')).flat().map(t => String(t).toLowerCase());
  const hasOrganization = schemaTypes.some(t => t === 'organization' || t === 'localbusiness');
  const hasFaqPage = schemaTypes.some(t => t === 'faqpage');
  const hasProduct = schemaTypes.some(t => t === 'product');
  const hasBreadcrumb = schemaTypes.some(t => t === 'breadcrumblist');
  const hasWebSite = schemaTypes.some(t => t === 'website');
  const hasPerson = schemaTypes.some(t => t === 'person');
  const allSchemaTypes = [...new Set(schemaTypes.filter(Boolean))];

  // Meta tags
  const metaDesc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']{0,300})["']/i) || [])[1] || '';
  const ogTitle = (html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']{0,200})["']/i) || [])[1] || '';
  const ogDesc = (html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']{0,300})["']/i) || [])[1] || '';
  const canonical = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1] || '';
  const h1Tags = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(x => x[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  const h2Tags = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(x => x[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean).slice(0, 10);
  const allLinks = [...html.matchAll(/href=["']([^"'#?]+)["']/gi)].map(x => x[1]).filter(Boolean);

  // Internal links analysis
  let baseOrigin = '';
  try { baseOrigin = new URL(url).origin; } catch {}
  const internalLinks = allLinks.filter(l => {
    if (l.startsWith('/')) return true;
    if (baseOrigin && l.startsWith(baseOrigin)) return true;
    return false;
  });
  const uniqueInternalPaths = [...new Set(internalLinks.map(l => {
    try { return new URL(l, url).pathname; } catch { return l; }
  }))];

  // Hreflang
  const hreflang = [...html.matchAll(/<link[^>]+hreflang=["']([^"']+)["']/gi)].map(x => x[1]);

  // FAQ detection (real questions in HTML, not schema)
  const faqPatterns = html.match(/<(details|summary|dt|[^>]+class=["'][^"']*faq[^"']*["'])[^>]*>/gi) || [];
  const questionMarks = (html.match(/\?<\//g) || []).length;

  // Viewport / mobile
  const hasMobileViewport = /<meta[^>]+name=["']viewport["']/i.test(html);

  // Open Graph image
  const ogImage = (html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || [])[1] || '';

  // Page word count (rough)
  const textContent = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').filter(w => w.length > 2).length;

  // Navigation depth hint — count nav links
  const navLinks = [...html.matchAll(/<nav[^>]*>([\s\S]*?)<\/nav>/gi)].map(x => x[1]);
  const navLinkCount = navLinks.reduce((acc, nav) => acc + (nav.match(/href=/gi) || []).length, 0);

  // Author signals
  const hasAuthorMeta = /<meta[^>]+name=["']author["']/i.test(html);
  const hasAuthorInText = /auteur|author|rédigé par|written by|par [A-Z]/i.test(html);

  // Structured contact info
  const hasPhone = /(\+33|0[1-9])[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/.test(html);
  const hasAddress = /\b\d{5}\b/.test(html); // French postal code
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(html);

  return {
    schemaTypes: allSchemaTypes,
    hasOrganization, hasFaqPage, hasProduct, hasBreadcrumb, hasWebSite, hasPerson,
    metaDesc, metaDescLength: metaDesc.length,
    ogTitle, ogDesc, ogImage,
    canonical,
    h1Tags, h1Count: h1Tags.length,
    h2Tags, h2Count: h2Tags.length,
    internalLinkCount: uniqueInternalPaths.length,
    uniqueInternalPaths: uniqueInternalPaths.slice(0, 20),
    hreflang,
    hasMobileViewport,
    faqIndicators: faqPatterns.length,
    questionMarksInText: questionMarks,
    wordCount,
    navLinkCount,
    hasAuthorMeta, hasAuthorInText,
    hasPhone, hasAddress, hasEmail,
    isSSL: url.startsWith('https://'),
    htmlLength: html.length,
  };
}

// ── Discover key internal URLs to crawl ──────────────────────────────────────
function discoverKeyUrls(homeHtml, baseUrl) {
  const origin = (() => { try { return new URL(baseUrl).origin; } catch { return ''; } })();
  const allHrefs = [...(homeHtml || '').matchAll(/href=["']([^"'#?]+)["']/gi)].map(x => x[1]);

  const keyPaths = ['/about', '/a-propos', '/apropos', '/qui-sommes-nous', '/contact', '/blog', '/services', '/produits', '/products', '/faq'];
  const found = new Set([baseUrl]);

  for (const href of allHrefs) {
    try {
      const abs = new URL(href, baseUrl).href;
      if (!abs.startsWith(origin)) continue;
      const path = new URL(abs).pathname.toLowerCase();
      if (keyPaths.some(k => path.includes(k))) found.add(abs);
    } catch {}
  }

  // Also add canonical key paths directly
  for (const p of keyPaths.slice(0, 4)) {
    found.add(origin + p);
  }

  return [...found].slice(0, 5); // max 5 pages to crawl
}

// ── Check sitemap & robots ────────────────────────────────────────────────────
async function checkSitemapAndRobots(origin) {
  const [sitemapRes, robotsRes] = await Promise.all([
    fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(4000) }).catch(() => null),
    fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(4000) }).catch(() => null),
  ]);
  const hasSitemap = sitemapRes?.ok && (sitemapRes.headers.get('content-type') || '').includes('xml');
  const sitemapHtml = hasSitemap ? await sitemapRes.text().catch(() => '') : '';
  const urlCountInSitemap = (sitemapHtml.match(/<url>/g) || []).length;

  const hasRobots = robotsRes?.ok;
  const robotsTxt = hasRobots ? await robotsRes.text().catch(() => '') : '';
  const robotsBlocksAll = /disallow:\s*\//i.test(robotsTxt) && !/disallow:\s*$/m.test(robotsTxt);

  return { hasSitemap, urlCountInSitemap, hasRobots, robotsBlocksAll };
}

// ── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'URL required' }, { status: 400 });
    }

    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    // ── Server-side quota enforcement (anti-abuse) ────────────────────────────
    const authUser = await base44.auth.me().catch(() => null);
    if (!authUser) return Response.json({ error: 'Authentication required' }, { status: 401 });
    const guardRes = await base44.functions.invoke('quotaGuard', { action: 'scan', site_url: cleanUrl }).catch(() => null);
    if (!guardRes?.data?.allowed) {
      console.log(`[analyzeWebsite] Quota blocked for ${authUser.email}: ${guardRes?.data?.reason || 'unknown'}`);
      return Response.json({ error: 'Quota exceeded', reason: guardRes?.data?.reason || 'scan_limit', quota: guardRes?.data || null }, { status: 429 });
    }

    let origin = '';
    try { origin = new URL(cleanUrl).origin; } catch {}

    // ── Step 1: Real crawl ────────────────────────────────────────────────────
    console.log(`[analyzeWebsite] Crawling: ${cleanUrl}`);
    const homeHtml = await crawlPage(cleanUrl);
    const homeSignals = extractSignals(homeHtml || '', cleanUrl);

    // Discover & crawl key sub-pages in parallel
    const keyUrls = discoverKeyUrls(homeHtml || '', cleanUrl);
    const [sitemapData, ...subPageHtmls] = await Promise.all([
      checkSitemapAndRobots(origin),
      ...keyUrls.slice(1, 4).map(u => crawlPage(u, 5000)),
    ]);

    // Extract signals from sub-pages
    const subSignals = subPageHtmls.map((html, i) => ({
      url: keyUrls[i + 1] || '',
      signals: extractSignals(html || '', keyUrls[i + 1] || cleanUrl),
      crawled: !!html,
    }));

    // Merge: check if about/blog/faq pages were found and crawled
    const aboutPage = subSignals.find(s => /about|propos|qui-sommes/i.test(s.url));
    const blogPage = subSignals.find(s => /blog|article|news/i.test(s.url));
    const faqPage = subSignals.find(s => /faq/i.test(s.url));
    const contactPage = subSignals.find(s => /contact/i.test(s.url));

    // Aggregate author signal across all pages
    const hasAnyAuthor = homeSignals.hasAuthorMeta || homeSignals.hasAuthorInText
      || subSignals.some(s => s.signals.hasAuthorMeta || s.signals.hasAuthorInText);

    // Canonical check — detect mismatches
    const canonicalMatchesUrl = homeSignals.canonical
      ? homeSignals.canonical.replace(/\/$/, '') === cleanUrl.replace(/\/$/, '')
      : true; // can't verify = neutral

    // Collect ALL schema types found across pages
    const allSchemaTypesFound = [...new Set([
      ...homeSignals.schemaTypes,
      ...subSignals.flatMap(s => s.signals.schemaTypes)
    ])];

    // Build a rich technical audit object to pass to LLM
    const technicalAudit = {
      url: cleanUrl,
      ssl: homeSignals.isSSL,
      crawlable: !!homeHtml,
      homePage: {
        h1: homeSignals.h1Tags,
        h2Count: homeSignals.h2Count,
        h2Sample: homeSignals.h2Tags.slice(0, 5),
        metaDesc: homeSignals.metaDesc || '(missing)',
        metaDescLength: homeSignals.metaDescLength,
        canonical: homeSignals.canonical || '(missing)',
        canonicalMatchesUrl,
        wordCount: homeSignals.wordCount,
        ogImage: homeSignals.ogImage ? 'present' : 'missing',
        hasMobileViewport: homeSignals.hasMobileViewport,
        hasPhone: homeSignals.hasPhone,
        hasEmail: homeSignals.hasEmail,
        hasAddress: homeSignals.hasAddress,
        internalLinks: homeSignals.internalLinkCount,
        navLinkCount: homeSignals.navLinkCount,
      },
      schemaMarkup: {
        typesDetected: allSchemaTypesFound,
        hasOrganization: homeSignals.hasOrganization,
        hasFaqSchema: homeSignals.hasFaqPage || subSignals.some(s => s.signals.hasFaqPage),
        hasProduct: homeSignals.hasProduct || subSignals.some(s => s.signals.hasProduct),
        hasBreadcrumb: homeSignals.hasBreadcrumb || subSignals.some(s => s.signals.hasBreadcrumb),
        hasPerson: hasPerson(homeSignals, subSignals),
      },
      pages: {
        aboutPageFound: !!aboutPage?.crawled,
        aboutPageUrl: aboutPage?.url || null,
        aboutHasAuthor: aboutPage?.signals?.hasAuthorMeta || aboutPage?.signals?.hasAuthorInText || false,
        blogPageFound: !!blogPage?.crawled,
        faqPageFound: !!faqPage?.crawled,
        faqFaqSchemaOnFaqPage: faqPage?.signals?.hasFaqPage || false,
        contactPageFound: !!contactPage?.crawled,
        contactHasPhone: contactPage?.signals?.hasPhone || homeSignals.hasPhone,
        contactHasEmail: contactPage?.signals?.hasEmail || homeSignals.hasEmail,
      },
      sitemap: {
        present: sitemapData.hasSitemap,
        urlCount: sitemapData.urlCountInSitemap,
        robotsPresent: sitemapData.hasRobots,
        robotsBlocksAll: sitemapData.robotsBlocksAll,
      },
      author: {
        anyAuthorSignal: hasAnyAuthor,
        aboutHasAuthor: aboutPage?.signals?.hasAuthorMeta || aboutPage?.signals?.hasAuthorInText || false,
      },
      hreflang: homeSignals.hreflang,
    };

    function hasPerson(home, subs) {
      return home.hasPerson || subs.some(s => s.signals.hasPerson);
    }

    console.log(`[analyzeWebsite] Technical audit built. Schemas found: ${allSchemaTypesFound.join(', ') || 'none'}`);

    // ── Step 2: LLM analysis on REAL crawled data ─────────────────────────────
    const [seoResult, aiEnginesResult, lrsResult] = await Promise.all([

      // SEO + AI scores — give LLM the REAL technical audit
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an SEO and AI visibility (AEO) expert. You have received a REAL technical audit of the site ${cleanUrl} — all data below comes from an actual HTML crawl of the site, not estimates.

REAL CRAWLED DATA:
${JSON.stringify(technicalAudit, null, 2)}

Based on this REAL data, calculate:
- ai_visibility_score: 0-100 (AI presence — schemas, mentions, citations)
- message_clarity_score: 0-100 (message clarity — H1, meta desc, words)
- commercial_presence_score: 0-100 (business signals — phone, address, likely Google listing)
- overall_score: 0-100 (weighted average)

Also provide (from your knowledge + web):
- business_name: string
- business_type: string (actual industry of the business)
- city: string
- country: string (2-letter ISO code)
- organic_traffic: number (monthly estimate)
- organic_keywords: number
- backlinks: number
- authority_score: number 0-100
- shock_insight: string (a short, punchy English sentence about what this site is concretely losing)

THEN generate ultra-specific ISSUES based ONLY on what the crawl revealed.
Each issue must:
- cite the exact page concerned if possible (e.g.: "on your homepage", "on /contact", "on your /blog page")
- be written in simple English for a non-technical person
- have an urgency: "high" | "medium" | "low"
- have an impact: string (what it concretely costs you)

Examples of GOOD issues based on real data:
- If hasOrganization=false → "Your homepage contains no structured information about your business — ChatGPT and Gemini don't know who you are when a customer asks them about your industry."
- If aboutPageFound=false → "No 'About' page detected — AI engines cannot identify who runs this business or build the trust needed to recommend you."
- If metaDescLength=0 → "Your homepage has no description — Google and AI engines see a page with no context, reducing your chances of appearing in response to a question."
- If hasFaqSchema=false and questionMarksInText>0 → "Your site contains questions but no structured FAQ markup — Perplexity and Google show your competitors in featured snippets instead of you."

Only generate issues based on what the crawl ACTUALLY found or didn't find. Maximum 5 issues, sorted by decreasing urgency.

Return valid JSON only.`,
        add_context_from_internet: true,
        model: 'gemini_3_1_pro',
        response_json_schema: {
          type: 'object',
          properties: {
            ai_visibility_score: { type: 'number' },
            message_clarity_score: { type: 'number' },
            commercial_presence_score: { type: 'number' },
            overall_score: { type: 'number' },
            business_name: { type: 'string' },
            business_type: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' },
            organic_traffic: { type: 'number' },
            organic_keywords: { type: 'number' },
            backlinks: { type: 'number' },
            authority_score: { type: 'number' },
            shock_insight: { type: 'string' },
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  problem: { type: 'string' },
                  impact: { type: 'string' },
                  urgency: { type: 'string' },
                  page: { type: 'string' },
                }
              }
            },
          }
        }
      }),

      // AI engines scores
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Estimate AI visibility scores for ${cleanUrl} on each engine (0-100).
A well-known site = 60-90. A local SMB with no online presence = 5-20.
Return only valid JSON.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            chatgpt_score: { type: 'number' },
            gemini_score: { type: 'number' },
            claude_score: { type: 'number' },
            mistral_score: { type: 'number' },
            llama_score: { type: 'number' },
            perplexity_score: { type: 'number' },
            grok_score: { type: 'number' },
            copilot_score: { type: 'number' },
            ai_mentions_count: { type: 'number' },
          }
        }
      }),

      // LRS + Action plan — ANCHORED in real crawl data
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AEO (Answer Engine Optimization) expert. Here is the REAL crawl of ${cleanUrl}:

${JSON.stringify(technicalAudit, null, 2)}

Calculate the LLM Resonance Score (LRS) based on this real data.

Then generate AN ACTION PLAN with 3 to 5 CONCRETE and SPECIFIC actions.
Each action must:
- Name the EXACT page to modify (e.g.: "/", "/about", "/blog/my-article")
- Name the EXACT element to add/modify (e.g.: "JSON-LD Organization block", "<meta name='description'> tag", "FAQ section with 6 questions in FAQPage schema")
- Explain in 1 sentence WHY it will change AI recommendations
- Estimate real effort (low = < 1h, medium = 2-4h, high = 1 day+)

EXAMPLES OF CONCRETE ACTIONS:
- If hasOrganization=false: "Add a JSON-LD Organization block on the homepage (/) with name, url, description, sameAs (social media)"
- If aboutPageFound=false: "Create an /about page with the founder's name and photo + Person schema"
- If hasFaqSchema=false: "Turn existing questions into FAQPage JSON-LD block on /faq — Perplexity directly cites structured FAQs"
- If metaDescLength < 50: "Write a 155-character meta description on / including your activity, city, and main benefit"
- If canonicalMatchesUrl=false: "Fix the canonical tag on / that points to ${homeSignals.canonical} instead of ${cleanUrl}"

All actions in English. Return valid JSON only.`,
        add_context_from_internet: false,
        model: 'gemini_3_1_pro',
        response_json_schema: {
          type: 'object',
          properties: {
            lrs_score: { type: 'number' },
            lrs_citation_score: { type: 'number' },
            lrs_sentiment_score: { type: 'number' },
            lrs_accuracy_score: { type: 'number' },
            lrs_trend: { type: 'string' },
            lrs_vs_industry: { type: 'number' },
            injection_plan: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  engine: { type: 'string' },
                  action_title: { type: 'string' },
                  action_detail: { type: 'string' },
                  page_url: { type: 'string' },
                  element: { type: 'string' },
                  gap: { type: 'string' },
                  platform: { type: 'string' },
                  impact: { type: 'string' },
                  effort: { type: 'string' },
                }
              }
            }
          }
        }
      }),
    ]);

    const result = {
      ...seoResult,
      ...aiEnginesResult,
      ...lrsResult,
      // Technical signals from real crawl (used by UI)
      has_schema_markup: allSchemaTypesFound.length > 0,
      has_ssl: homeSignals.isSSL,
      has_mobile_friendly: homeSignals.hasMobileViewport,
      has_sitemap: sitemapData.hasSitemap,
      has_robots_txt: sitemapData.hasRobots,
      has_google_business: homeSignals.hasAddress || homeSignals.hasPhone,
      // Raw crawl data for debugging / fix instructions
      _crawl: {
        ...technicalAudit,
        schemaTypesFound: allSchemaTypesFound,
      },
      url: cleanUrl,
      analyzed_at: new Date().toISOString(),
    };

    // Create lead (async, non-blocking)
    base44.asServiceRole.entities.ContactLead.create({
      website: cleanUrl,
      first_name: result.business_name || '',
      role: result.business_type || '',
      message: `AI scan: LRS ${result.lrs_score}/100 | score ${result.overall_score}/100 | schemas: ${allSchemaTypesFound.join(', ') || 'none'}`,
      status: 'new',
    }).catch(() => {});

    // Save to BusinessProfile
    try {
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ created_by_id: user.id });
        const existing = profiles.find(p => p.site_url === cleanUrl);
        let brand_keywords = JSON.stringify(result);
        try {
          const fileObj = new File([brand_keywords], 'data.json', { type: 'application/json' });
          const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: fileObj });
          if (uploadRes?.file_url) brand_keywords = uploadRes.file_url;
        } catch {}

        const profileFields = {
          site_url: cleanUrl,
          identity_name: result.business_name || '',
          identity_industry: result.business_type || '',
          identity_city: result.city || '',
          score_ai_visibility: result.ai_visibility_score || 0,
          score_message_clarity: result.message_clarity_score || 0,
          score_commercial_signal: result.commercial_presence_score || 0,
          score_overall: result.overall_score || 0,
          last_scan: new Date().toISOString(),
          scan_in_progress: false,
          brand_keywords,
        };
        if (existing) {
          await base44.asServiceRole.entities.BusinessProfile.update(existing.id, profileFields);
        } else {
          await base44.asServiceRole.entities.BusinessProfile.create({ ...profileFields, created_by_id: user.id });
        }

        // Record consumption + history snapshot (server-side, non-forgeable)
        await base44.asServiceRole.entities.CreditLedger.create({
          user_id: user.id, action: 'SCAN', amount: -1,
          description: `Full scan ${cleanUrl}`, timestamp: new Date().toISOString(),
        }).catch(() => {});
        await base44.asServiceRole.entities.ScanRecord.create({
          user_id: user.id, site_url: cleanUrl,
          score_overall: result.overall_score || 0,
          score_ai_visibility: result.ai_visibility_score || 0,
          score_message_clarity: result.message_clarity_score || 0,
          score_commercial_signal: result.commercial_presence_score || 0,
          lrs_score: result.lrs_score || 0,
          scan_type: 'full',
        }).catch(() => {});
      }
    } catch {}

    return Response.json(result);
  } catch (error) {
    console.error('analyzeWebsite error:', error);
    const status = error?.response?.status === 429 || error?.message?.includes('quota') ? 429 : 500;
    return Response.json({ error: error?.message || 'Analysis failed' }, { status });
  }
});