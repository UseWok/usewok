import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { url } = body;
    if (!url) return Response.json({ error: 'URL required' }, { status: 400 });

    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    const domain = cleanUrl.replace(/https?:\/\//, '').split('/')[0];

    // Fetch real HTML to do a genuine technical audit
    let htmlContent = '';
    let fetchedUrl = cleanUrl;
    try {
      const resp = await fetch(cleanUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AuditBot/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      fetchedUrl = resp.url;
      htmlContent = await resp.text();
    } catch (_) {
      htmlContent = '';
    }

    // Real HTML-based checks
    const hasSsl        = cleanUrl.startsWith('https://') || fetchedUrl.startsWith('https://');
    const hasTitle      = /<title[^>]*>[^<]{1,}/i.test(htmlContent);
    const hasMetaDesc   = /<meta[^>]+name=["']description["'][^>]*content=["'][^"']{10}/i.test(htmlContent);
    const hasH1         = /<h1[\s>]/i.test(htmlContent);
    const hasSchema     = /application\/ld\+json/i.test(htmlContent) || /itemscope/i.test(htmlContent);
    const hasOg         = /property=["']og:/i.test(htmlContent);
    const hasSitemapRef = /sitemap/i.test(htmlContent);
    const hasRobotsRef  = /robots/i.test(htmlContent);
    const hasCanonical  = /rel=["']canonical/i.test(htmlContent);
    const hasMobileVp   = /name=["']viewport["']/i.test(htmlContent);
    const hasAnalytics  = /gtag|google-analytics|_ga|plausible|hotjar|segment/i.test(htmlContent);
    const inlineScripts = (htmlContent.match(/<script/gi) || []).length;
    const externalCss   = (htmlContent.match(/<link[^>]+stylesheet/gi) || []).length;
    const hasLazyLoad   = /loading=["']lazy["']/i.test(htmlContent);
    const hasCsp        = /content-security-policy/i.test(htmlContent);
    const hasAmpersand  = /&amp;/i.test(htmlContent);

    // Extract title and description values
    const titleMatch   = htmlContent.match(/<title[^>]*>([^<]{0,120})<\/title>/i);
    const descMatch    = htmlContent.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']{0,300})["']/i)
                      || htmlContent.match(/<meta[^>]+content=["']([^"']{0,300})["'][^>]+name=["']description["']/i);
    const titleValue   = titleMatch ? titleMatch[1].trim() : '';
    const descValue    = descMatch ? descMatch[1].trim() : '';

    // Robots.txt fetch
    let robotsTxt = '';
    let sitemapFound = false;
    let aiBotsBlocked = [];
    let aiBotsAllowed = ['ChatGPT-User', 'GPTBot', 'OAI-SearchBot', 'Google-Extended', 'ClaudeBot', 'Bingbot'];
    try {
      const robotsResp = await fetch(`${cleanUrl.split('/').slice(0,3).join('/')}/robots.txt`, { signal: AbortSignal.timeout(5000) });
      if (robotsResp.ok) {
        robotsTxt = await robotsResp.text();
        // Check for sitemap declaration
        sitemapFound = /^Sitemap:/im.test(robotsTxt);
        // Detect blocked AI bots
        const BOTS = ['GPTBot','ChatGPT-User','OAI-SearchBot','Google-Extended','ClaudeBot','PerplexityBot','cohere-ai'];
        const disallowedSections = [];
        let currentAgents = [];
        for (const line of robotsTxt.split('\n')) {
          const trimmed = line.trim();
          if (/^User-agent:/i.test(trimmed)) {
            currentAgents = [trimmed.replace(/^User-agent:\s*/i,'').trim()];
          } else if (/^Disallow:\s*\//i.test(trimmed) && currentAgents.some(a => a !== '*')) {
            disallowedSections.push(...currentAgents);
          }
        }
        aiBotsBlocked = BOTS.filter(b => disallowedSections.some(d => d.toLowerCase() === b.toLowerCase()));
        aiBotsAllowed = BOTS.filter(b => !aiBotsBlocked.includes(b));
      }
    } catch (_) {}

    // Sitemap fetch
    let sitemapUrls = [];
    let sitemapStatus = 'not_found';
    try {
      const sitemapResp = await fetch(`${cleanUrl.split('/').slice(0,3).join('/')}/sitemap.xml`, { signal: AbortSignal.timeout(5000) });
      if (sitemapResp.ok) {
        const sitemapXml = await sitemapResp.text();
        sitemapStatus = 'found';
        sitemapUrls = (sitemapXml.match(/<loc>([^<]+)<\/loc>/gi) || []).map(m => m.replace(/<\/?loc>/gi,'')).slice(0,100);
        sitemapFound = true;
      }
    } catch (_) {}

    // Now run the AI audit analysis (crawl simulation + SEO issues)
    const [auditResult] = await Promise.all([
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a technical SEO and AI crawlability auditor. Analyze this website in depth: ${cleanUrl}

Real data collected from the HTML:

Real data collected from the HTML:
- SSL: ${hasSsl}
- Has <title>: ${hasTitle} — value: "${titleValue}"
- Has meta description: ${hasMetaDesc} — value: "${descValue}"
- Has H1: ${hasH1}
- Has Schema Markup (JSON-LD or microdata): ${hasSchema}
- Has Open Graph tags: ${hasOg}
- Has canonical tag: ${hasCanonical}
- Has viewport meta (mobile-friendly): ${hasMobileVp}
- Inline scripts count: ${inlineScripts}
- External CSS count: ${externalCss}
- Has lazy loading: ${hasLazyLoad}
- Has analytics: ${hasAnalytics}
- robots.txt found: ${robotsTxt.length > 0}
- sitemap.xml found: ${sitemapFound}
- AI bots blocked in robots.txt: ${JSON.stringify(aiBotsBlocked)}
- AI bots allowed: ${JSON.stringify(aiBotsAllowed)}
- Pages in sitemap: ${sitemapUrls.length}

Based on this real data AND your knowledge of this domain, return a complete audit JSON:

{
  "site_health_score": number 0-100 (calculated from real issues found),
  "crawlability_score": number 0-100,
  "performance_score": number 0-100,
  "ai_readiness_score": number 0-100 (based on schema, robots, sitemap),
  "pages_crawled": number (estimated, based on sitemap or site size),
  "pages_healthy": number,
  "pages_with_issues": number,
  "pages_redirects": number,
  "pages_blocked": number,
  "pages_broken": number,
  "indexable_pages": number,
  "non_indexable_pages": number,
  "site_name": string (domain name cleaned),
  "robots_txt_content": string (the actual robots.txt if found, else empty),
  "sitemap_status": "found"|"not_found",
  "sitemap_url_count": number,
  "crawl_depth_avg": number (1-5),
  "crawl_budget_waste": number 0-10,
  "has_ssl": boolean,
  "has_schema": boolean,
  "has_sitemap": boolean,
  "has_robots_txt": boolean,
  "has_mobile_friendly": boolean,
  "has_canonical": boolean,
  "has_meta_description": boolean,
  "has_og_tags": boolean,
  "ai_bots_blocked": array of strings (bot names blocked),
  "ai_bots_allowed": array of strings (bot names allowed),
  "http_2xx_count": number,
  "http_3xx_count": number,
  "http_4xx_count": number,
  "http_5xx_count": number,
  "avg_page_load_seconds": number (estimated),
  "pages_slow": number (>3s),
  "pages_medium": number (1-3s),
  "pages_fast": number (<1s),
  "pages_fastest": number (<0.5s),
  "js_css_total_files": number (estimated),
  "issues": array of objects {
    "id": string (slug),
    "title": string (clear English title — no jargon, explain what it means for the business),
    "category": string (one of: "Meta tags", "Content", "Crawlability", "CSS", "Security", "Links", "AI"),
    "severity": "error"|"warning"|"notice",
    "count": number (pages affected),
    "description": string (2-3 sentences in PLAIN English a non-technical business owner understands. NO jargon like "crawl budget", "link equity", "indexation", "canonical". Explain what is broken and why it hurts their business in everyday words),
    "fix_steps": array of 3-4 strings in PLAIN English (concrete, actionable steps. NO tool names like "Screaming Frog", "Ahrefs", "Google Search Console" unless absolutely necessary. NO technical jargon. Say "check your site for broken links" not "crawl your full site with Screaming Frog". Each step must be doable by a non-technical person or clearly say when to ask a developer)
  },
  "top_pages": array of max 15 objects {
    "url": string (full URL),
    "status_code": number (200, 301, 404, etc.),
    "crawl_depth": number (1-4),
    "update_frequency": string ("daily"|"weekly"|"monthly"),
    "indexable": boolean,
    "has_title": boolean,
    "has_meta_desc": boolean,
    "issues_count": number
  },
  "crawl_budget_items": array of objects {
    "label": string,
    "value": number
  },
  "inbound_links_distribution": array of objects {
    "range": string,
    "count": number
  },
  "js_files_distribution": array of objects {
    "range": string,
    "count": number
  },
  "js_size_distribution": array of objects {
    "range": string,
    "count": number
  },
  "market_traffic": {
    "direct": number,
    "organic": number,
    "organic_pct": string,
    "paid": number,
    "social": number,
    "social_pct": string,
    "other": number,
    "other_pct": string
  }
}

Be realistic. Base numbers on actual site size. A small startup site has ~20-80 pages. A large e-commerce has 1000+.

CRITICAL LANGUAGE RULE: The audience is non-technical business owners (restaurant owners, freelancers, local shops). Write ALL descriptions and fix_steps in plain everyday English. Replace every technical term with its plain meaning:
- "crawl budget" → "AI and Google waste time on broken pages"
- "link equity" → "your pages lose authority"
- "indexation" → "Google and AI can't find your pages"
- "canonical" → "tell Google which page is the main one"
- "301 redirect" → "forward old pages to new ones"
- "4xx/5xx errors" → "broken pages that don't load"
- "href" → "link"
- "DOM" / "render" → skip, not relevant
- "schema markup" → "structured data that helps AI understand your business"
Never name tools (Screaming Frog, Ahrefs, Semrush) — describe the action instead ("check all your pages for broken links"). If a step requires a developer, say "ask your developer to" in plain words.`,
        add_context_from_internet: true,
        model: 'gemini_3_1_pro',
        response_json_schema: {
          type: 'object',
          properties: {
            site_health_score: { type: 'number' },
            crawlability_score: { type: 'number' },
            performance_score: { type: 'number' },
            ai_readiness_score: { type: 'number' },
            pages_crawled: { type: 'number' },
            pages_healthy: { type: 'number' },
            pages_with_issues: { type: 'number' },
            pages_redirects: { type: 'number' },
            pages_blocked: { type: 'number' },
            pages_broken: { type: 'number' },
            indexable_pages: { type: 'number' },
            non_indexable_pages: { type: 'number' },
            site_name: { type: 'string' },
            robots_txt_content: { type: 'string' },
            sitemap_status: { type: 'string' },
            sitemap_url_count: { type: 'number' },
            crawl_depth_avg: { type: 'number' },
            crawl_budget_waste: { type: 'number' },
            has_ssl: { type: 'boolean' },
            has_schema: { type: 'boolean' },
            has_sitemap: { type: 'boolean' },
            has_robots_txt: { type: 'boolean' },
            has_mobile_friendly: { type: 'boolean' },
            has_canonical: { type: 'boolean' },
            has_meta_description: { type: 'boolean' },
            has_og_tags: { type: 'boolean' },
            ai_bots_blocked: { type: 'array', items: { type: 'string' } },
            ai_bots_allowed: { type: 'array', items: { type: 'string' } },
            http_2xx_count: { type: 'number' },
            http_3xx_count: { type: 'number' },
            http_4xx_count: { type: 'number' },
            http_5xx_count: { type: 'number' },
            avg_page_load_seconds: { type: 'number' },
            pages_slow: { type: 'number' },
            pages_medium: { type: 'number' },
            pages_fast: { type: 'number' },
            pages_fastest: { type: 'number' },
            js_css_total_files: { type: 'number' },
            issues: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, title: { type: 'string' }, category: { type: 'string' }, severity: { type: 'string' }, count: { type: 'number' }, description: { type: 'string' }, fix_steps: { type: 'array', items: { type: 'string' } } } } },
            top_pages: { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, status_code: { type: 'number' }, crawl_depth: { type: 'number' }, update_frequency: { type: 'string' }, indexable: { type: 'boolean' }, has_title: { type: 'boolean' }, has_meta_desc: { type: 'boolean' }, issues_count: { type: 'number' } } } },
            crawl_budget_items: { type: 'array', items: { type: 'object', properties: { label: { type: 'string' }, value: { type: 'number' } } } },
            inbound_links_distribution: { type: 'array', items: { type: 'object', properties: { range: { type: 'string' }, count: { type: 'number' } } } },
            js_files_distribution: { type: 'array', items: { type: 'object', properties: { range: { type: 'string' }, count: { type: 'number' } } } },
            js_size_distribution: { type: 'array', items: { type: 'object', properties: { range: { type: 'string' }, count: { type: 'number' } } } },
            market_traffic: { type: 'object', properties: { direct: { type: 'number' }, organic: { type: 'number' }, organic_pct: { type: 'string' }, paid: { type: 'number' }, social: { type: 'number' }, social_pct: { type: 'string' }, other: { type: 'number' }, other_pct: { type: 'string' } } },
          }
        }
      }),
    ]);

    // Override with hard real-data values we actually fetched
    const result = {
      ...auditResult,
      has_ssl: hasSsl,
      has_schema: hasSchema,
      has_sitemap: sitemapFound,
      has_robots_txt: robotsTxt.length > 0,
      has_mobile_friendly: hasMobileVp,
      has_canonical: hasCanonical,
      has_meta_description: hasMetaDesc,
      has_og_tags: hasOg,
      ai_bots_blocked: aiBotsBlocked,
      ai_bots_allowed: aiBotsAllowed,
      robots_txt_content: robotsTxt || auditResult.robots_txt_content || '',
      sitemap_status: sitemapFound ? 'found' : 'not_found',
      sitemap_url_count: sitemapUrls.length || auditResult.sitemap_url_count || 0,
      url: cleanUrl,
      domain,
      analyzed_at: new Date().toISOString(),
    };

    // ── Persist audit data to BusinessProfile ──
    try {
      const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ created_by_id: user.id });
      const existing = profiles.find(p => p.site_url === cleanUrl);
      if (existing) {
        // Load existing brand_keywords and merge audit_data
        let cached = {};
        try {
          if (existing.brand_keywords?.startsWith('http')) {
            const fileRes = await fetch(existing.brand_keywords);
            cached = await fileRes.json();
          } else {
            cached = JSON.parse(existing.brand_keywords || '{}');
          }
        } catch {}
        const merged = { ...cached, audit_data: result, audit_analyzed_at: result.analyzed_at };
        let brand_keywords = JSON.stringify(merged);
        try {
          const fileObj = new File([brand_keywords], 'data.json', { type: 'application/json' });
          const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: fileObj });
          if (uploadRes?.file_url) brand_keywords = uploadRes.file_url;
        } catch {}
        await base44.asServiceRole.entities.BusinessProfile.update(existing.id, { brand_keywords });
      }
    } catch (e) {
      console.error('[analyzeAudit] persist error:', e);
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});