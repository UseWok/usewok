import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Real HTML crawler ─────────────────────────────────────────────────────────
async function crawlPage(url, timeoutMs = 8000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UseWokBot/1.0; +https://usewok.com/bot)' }
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    return html;
  } catch {
    return null;
  }
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
        metaDesc: homeSignals.metaDesc || '(absente)',
        metaDescLength: homeSignals.metaDescLength,
        canonical: homeSignals.canonical || '(absent)',
        canonicalMatchesUrl,
        wordCount: homeSignals.wordCount,
        ogImage: homeSignals.ogImage ? 'présente' : 'absente',
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
        prompt: `Tu es un expert SEO et visibilité IA (AEO). Tu as reçu un audit technique RÉEL du site ${cleanUrl} — toutes les données ci-dessous proviennent d'un vrai crawl HTML du site, pas d'estimations.

DONNÉES RÉELLES CRAWLÉES :
${JSON.stringify(technicalAudit, null, 2)}

Sur la base de ces données RÉELLES, calcule :
- ai_visibility_score: 0-100 (présence IA — schémas, mentions, citations)
- message_clarity_score: 0-100 (clarté du message — H1, meta desc, mots)  
- commercial_presence_score: 0-100 (signaux business — téléphone, adresse, fiche Google probable)
- overall_score: 0-100 (moyenne pondérée)

Et fournis aussi (depuis tes connaissances + web) :
- business_name: string
- business_type: string (secteur réel de l'entreprise)
- city: string
- country: string (code ISO 2 lettres)
- organic_traffic: number (estimation mensuelle)
- organic_keywords: number
- backlinks: number
- authority_score: number 0-100
- shock_insight: string (une phrase courte et percutante en français sur ce que ce site perd concrètement)

PUIS génère des ISSUES ultra-concrètes basées UNIQUEMENT sur ce que le crawl a révélé.
Chaque issue doit :
- citer la page exacte concernée si possible (ex: "sur votre page d'accueil", "sur /contact", "sur votre page /blog")
- être formulée en français simple pour un non-technicien
- avoir un urgency : "high" | "medium" | "low"
- avoir un impact: string (ce que ça fait perdre concrètement)

Exemples de BONS issues basés sur les données réelles :
- Si hasOrganization=false → "Votre page d'accueil ne contient aucune information structurée sur votre entreprise — ChatGPT et Gemini ne savent pas qui vous êtes quand un client les interroge sur votre secteur."
- Si aboutPageFound=false → "Aucune page 'À propos' détectée — les IA ne peuvent pas identifier qui dirige cette entreprise ni établir la confiance nécessaire pour vous recommander."
- Si metaDescLength=0 → "Votre page d'accueil n'a aucune description — Google et les IA voient une page sans contexte, ce qui réduit vos chances d'apparaître en réponse à une question."
- Si hasFaqSchema=false et questionMarksInText>0 → "Votre site contient des questions mais sans balisage FAQ structuré — Perplexity et Google affichent vos concurrents en featured snippet à votre place."

Ne génère que des issues basées sur ce que le crawl a RÉELLEMENT trouvé ou pas trouvé. Maximum 5 issues, classées par urgency décroissante.

Retourne JSON valide uniquement.`,
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
        prompt: `Estime les scores de visibilité IA pour ${cleanUrl} sur chaque moteur (0-100).
Un site bien connu = 60-90. Une PME locale sans présence en ligne = 5-20.
Retourne uniquement du JSON valide.`,
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
        prompt: `Tu es expert en AEO (Answer Engine Optimization). Voici le crawl RÉEL de ${cleanUrl} :

${JSON.stringify(technicalAudit, null, 2)}

Calcule le LLM Resonance Score (LRS) basé sur ces données réelles.

Puis génère UN PLAN D'ACTION en 3 à 5 actions CONCRÈTES et SPÉCIFIQUES.
Chaque action doit :
- Nommer la page EXACTE à modifier (ex: "/", "/a-propos", "/blog/mon-article")
- Nommer l'élément EXACT à ajouter/modifier (ex: "bloc JSON-LD de type Organization", "balise <meta name='description'>", "section FAQ avec 6 questions en schema FAQPage")
- Expliquer en 1 phrase POURQUOI ça va changer les recommandations IA
- Estimer l'effort réel (low = < 1h, medium = 2-4h, high = 1 jour+)

EXEMPLES D'ACTIONS CONCRÈTES :
- Si hasOrganization=false : "Ajouter un bloc JSON-LD Organization sur la page d'accueil (/) avec name, url, description, sameAs (réseaux sociaux)"
- Si aboutPageFound=false : "Créer une page /a-propos avec le nom et la photo du fondateur + schéma Person"
- Si hasFaqSchema=false : "Transformer les questions existantes en bloc FAQPage JSON-LD sur /faq — Perplexity cite directement les FAQs structurées"
- Si metaDescLength < 50 : "Rédiger une meta description de 155 caractères sur / incluant votre activité, ville, et bénéfice principal"
- Si canonicalMatchesUrl=false : "Corriger la balise canonical sur / qui pointe vers ${homeSignals.canonical} au lieu de ${cleanUrl}"

Toutes les actions en français. Retourne JSON valide uniquement.`,
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
      }
    } catch {}

    return Response.json(result);
  } catch (error) {
    console.error('analyzeWebsite error:', error);
    const status = error?.response?.status === 429 || error?.message?.includes('quota') ? 429 : 500;
    return Response.json({ error: error?.message || 'Analysis failed' }, { status });
  }
});