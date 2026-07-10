// ── Demo mode for usewok.com ─────────────────────────────────────
// When a user adds usewok.com as their site, the app instantly populates
// all pages with realistic demo data — no AI calls, no waiting.

import { base44 } from '@/api/base44Client';

const DEMO_DOMAIN = 'usewok.com';

export function isDemoDomain(url) {
  if (!url) return false;
  const domain = url.replace(/https?:\/\//, '').split('/')[0].toLowerCase();
  return domain === DEMO_DOMAIN || domain === `www.${DEMO_DOMAIN}`;
}

// ── Main scan result (stored in BusinessProfile.brand_keywords) ──
function getDemoScanResult(cleanUrl) {
  return {
    url: cleanUrl,
    analyzed_at: new Date().toISOString(),
    scan_type: 'full',
    business_name: 'UseWok',
    business_type: 'AI visibility platform',
    city: 'Paris',
    country: 'FR',
    overall_score: 68,
    ai_visibility_score: 65,
    message_clarity_score: 72,
    commercial_presence_score: 67,
    organic_traffic: 4200,
    organic_keywords: 860,
    backlinks: 1240,
    authority_score: 38,
    ai_mentions_count: 85,
    shock_insight: 'ChatGPT and Gemini mention your competitors 3× more often than you — you\'re losing qualified traffic every day.',
    // Engine scores
    chatgpt_score: 62,
    gemini_score: 68,
    claude_score: 55,
    perplexity_score: 65,
    copilot_score: 50,
    mistral_score: 58,
    llama_score: 42,
    grok_score: 48,
    // LRS
    lrs_score: 64,
    lrs_citation_score: 58,
    lrs_sentiment_score: 72,
    lrs_accuracy_score: 66,
    lrs_trend: 'rising',
    lrs_vs_industry: 8,
    // Technical flags
    has_schema_markup: true,
    has_ssl: true,
    has_mobile_friendly: true,
    has_sitemap: true,
    has_robots_txt: true,
    has_google_business: true,
    // Issues
    issues: [
      { problem: 'No FAQPage schema on your blog — Perplexity and Google show competitors in featured snippets instead of you.', impact: 'You lose ~30% of AI-cited answers on informational queries.', urgency: 'high', page: '/blog' },
      { problem: 'Your /pricing page has no structured Product schema — AI engines can\'t surface your plans in comparison queries.', impact: 'Potential customers comparing tools via AI never see your pricing.', urgency: 'medium', page: '/pricing' },
      { problem: 'No author bios on blog posts — AI engines can\'t verify who wrote your content, reducing trust signals.', impact: 'Claude and Gemini cite anonymous content 40% less often.', urgency: 'medium', page: '/blog' },
      { problem: 'Your homepage title is too long (72 chars) — it gets truncated in AI summaries.', impact: 'Your brand name is cut off in search and AI answers.', urgency: 'low', page: '/' },
    ],
    // Action plan
    injection_plan: [
      { engine: 'Perplexity', action_title: 'Add FAQPage JSON-LD to blog posts', action_detail: 'Create a FAQPage schema block with 5-6 Q&As on each blog article.', page_url: '/blog', element: 'JSON-LD FAQPage', gap: 'Perplexity directly cites structured FAQs — you\'ll appear in answer boxes.', platform: 'Website', impact: 'High', effort: 'low' },
      { engine: 'ChatGPT', action_title: 'Add Product schema to /pricing', action_detail: 'Add Product + Offer schema with plan names and prices.', page_url: '/pricing', element: 'JSON-LD Product', gap: 'ChatGPT can then surface your plans when users ask about pricing in your category.', platform: 'Website', impact: 'Medium', effort: 'low' },
      { engine: 'Claude', action_title: 'Add author Person schema on blog', action_detail: 'Create /author pages with name, bio, photo and Person schema.', page_url: '/blog', element: 'JSON-LD Person', gap: 'Claude weighs author authority heavily — cited content gains 30%+ visibility.', platform: 'Website', impact: 'Medium', effort: 'medium' },
      { engine: 'Gemini', action_title: 'Shorten homepage title to ≤60 chars', action_detail: 'Trim the <title> tag so your brand name isn\'t truncated.', page_url: '/', element: '<title> tag', gap: 'Full brand name appears in AI summaries instead of being cut off.', platform: 'Website', impact: 'Low', effort: 'low' },
    ],
    // Competitors for AIVisibilityReport SOV bar
    competitors: [
      { name: 'UseWok', is_you: true, share: 18 },
      { name: 'Profound', is_you: false, share: 32 },
      { name: 'AthenaHQ', is_you: false, share: 24 },
      { name: 'Otterly.ai', is_you: false, share: 16 },
      { name: 'Other', is_you: false, share: 10 },
    ],
    // Suggestions for CompetitorsPage
    competitor_suggestions: [
      { name: 'Peec.ai', domain: 'peec.ai', reason: 'Cited by Gemini in AI visibility tool comparisons' },
      { name: 'Wrtn', domain: 'wrtn.ai', reason: 'Appears in Perplexity recommendations for AEO platforms' },
    ],
  };
}

// ── Dashboard overview (overview_data in profile) ──
function getDemoOverview(cleanUrl) {
  return {
    brand_name: 'UseWok',
    domain: 'usewok.com',
    url: cleanUrl,
    geo_score: 68,
    score_breakdown: { narrative: 42, authority: 28, referral: 18, brand_pct: 68, website_pct: 72, earned_pct: 45 },
    evolution: [
      { date_label: 'Jun 12', value: 52 },
      { date_label: 'Jun 19', value: 55 },
      { date_label: 'Jun 26', value: 58 },
      { date_label: 'Jul 3', value: 61 },
      { date_label: 'Jul 10', value: 64 },
      { date_label: 'Jul 17', value: 66 },
      { date_label: 'Jul 24', value: 68 },
    ],
    competitors: [
      { name: 'Profound', domain: 'profound.com', visibility_pct: 32, is_you: false },
      { name: 'UseWok', domain: 'usewok.com', visibility_pct: 18, is_you: true },
      { name: 'AthenaHQ', domain: 'athenahq.com', visibility_pct: 24, is_you: false },
      { name: 'Otterly.ai', domain: 'otterly.ai', visibility_pct: 16, is_you: false },
    ],
    llms_citing: [
      { engine: 'gemini', label: 'Gemini', citations: 6 },
      { engine: 'chatgpt', label: 'ChatGPT', citations: 4 },
      { engine: 'claude', label: 'Claude', citations: 2 },
      { engine: 'perplexity', label: 'Perplexity', citations: 5 },
    ],
    cited_pages: [
      { url: 'usewok.com', citations: 8 },
      { url: 'usewok.com/pricing', citations: 4 },
      { url: 'usewok.com/blog/ai-visibility', citations: 3 },
      { url: 'usewok.com/about', citations: 1 },
    ],
    zones: [
      { zone: 'Europe', score: 72, rank: 1, is_best: true },
      { zone: 'North America', score: 58, rank: 2, is_best: false },
      { zone: 'Asia', score: 35, rank: 3, is_best: false },
    ],
    languages: [
      { language: 'English', flag: '🇬🇧', score: 68, prompts: 42, strength_label: 'Good' },
      { language: 'French', flag: '🇫🇷', score: 75, prompts: 28, strength_label: 'Strong' },
      { language: 'Spanish', flag: '🇪🇸', score: 32, prompts: 10, strength_label: 'Weak' },
    ],
    tasks: [
      { title: 'Add FAQPage schema to blog posts', priority: 'high', impact: 'Get cited by Perplexity in answer boxes' },
      { title: 'Add Product schema to /pricing', priority: 'medium', impact: 'Surface plans in AI comparison queries' },
      { title: 'Create author bios with Person schema', priority: 'medium', impact: 'Boost trust signals for Claude' },
      { title: 'Shorten homepage title to ≤60 chars', priority: 'low', impact: 'Full brand name in AI summaries' },
    ],
    analyzed_at: new Date().toISOString(),
  };
}

// ── Audit data (audit_data in profile) ──
function getDemoAuditData(cleanUrl) {
  return {
    url: cleanUrl,
    domain: 'usewok.com',
    analyzed_at: new Date().toISOString(),
    site_health_score: 74,
    crawlability_score: 82,
    performance_score: 61,
    ai_readiness_score: 68,
    pages_crawled: 48,
    pages_healthy: 35,
    pages_with_issues: 10,
    pages_redirects: 2,
    pages_blocked: 1,
    pages_broken: 0,
    indexable_pages: 44,
    non_indexable_pages: 4,
    site_name: 'usewok.com',
    sitemap_status: 'found',
    sitemap_url_count: 52,
    crawl_depth_avg: 2.4,
    crawl_budget_waste: 3,
    has_ssl: true,
    has_schema: true,
    has_sitemap: true,
    has_robots_txt: true,
    has_mobile_friendly: true,
    has_canonical: true,
    has_meta_description: true,
    has_og_tags: true,
    ai_bots_blocked: [],
    ai_bots_allowed: ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'Google-Extended', 'ClaudeBot', 'Bingbot'],
    http_2xx_count: 44,
    http_3xx_count: 2,
    http_4xx_count: 2,
    http_5xx_count: 0,
    avg_page_load_seconds: 2.1,
    pages_slow: 4,
    pages_medium: 18,
    pages_fast: 22,
    pages_fastest: 4,
    js_css_total_files: 14,
    issues: [
      { id: 'title-length', title: 'Title too long', category: 'Meta tags', severity: 'warning', count: 1, description: 'Your homepage title is 72 characters — search engines and AI engines truncate it, so your full brand name doesn\'t appear.', fix_steps: ['Go to your website editor and find the homepage title tag', 'Shorten it to 60 characters or less', 'Make sure your brand name is at the start', 'Ask your developer if you can\'t find the title tag'] },
      { id: 'duplicate-h1', title: 'More than one h1 tag', category: 'Content', severity: 'warning', count: 2, description: 'Some pages have more than one main heading. This confuses search engines and AI about what the page is really about.', fix_steps: ['Check each page listed below', 'Keep only one main heading (h1) per page', 'Change the others to sub-headings (h2)', 'Ask your developer to help if needed'] },
      { id: 'missing-alt', title: 'Images without alt text', category: 'Content', severity: 'notice', count: 8, description: 'Some images on your site don\'t have descriptions. AI engines and screen readers can\'t understand what these images show.', fix_steps: ['Go through your pages and find images without alt text', 'Add a short description to each image', 'Describe what the image shows in plain words', 'Your website editor should have an alt text field for each image'] },
      { id: 'slow-pages', title: 'Slow loading pages', category: 'Performance', severity: 'warning', count: 4, description: '4 pages take more than 3 seconds to load. AI engines and visitors may leave before they finish loading.', fix_steps: ['Ask your developer to check the slow pages', 'Compress images to make them smaller', 'Remove unused scripts and plugins', 'Consider a caching plugin if you use WordPress'] },
    ],
    top_pages: [
      { url: 'https://usewok.com', status_code: 200, crawl_depth: 1, update_frequency: 'weekly', indexable: true, has_title: true, has_meta_desc: true, issues_count: 1 },
      { url: 'https://usewok.com/pricing', status_code: 200, crawl_depth: 1, update_frequency: 'monthly', indexable: true, has_title: true, has_meta_desc: true, issues_count: 0 },
      { url: 'https://usewok.com/blog', status_code: 200, crawl_depth: 1, update_frequency: 'daily', indexable: true, has_title: true, has_meta_desc: true, issues_count: 0 },
      { url: 'https://usewok.com/about', status_code: 200, crawl_depth: 1, update_frequency: 'monthly', indexable: true, has_title: true, has_meta_desc: false, issues_count: 1 },
      { url: 'https://usewok.com/blog/ai-visibility', status_code: 200, crawl_depth: 2, update_frequency: 'monthly', indexable: true, has_title: true, has_meta_desc: true, issues_count: 0 },
    ],
    crawl_budget_items: [
      { label: 'Healthy pages', value: 35 },
      { label: 'Pages with issues', value: 10 },
      { label: 'Redirects', value: 2 },
      { label: 'Blocked', value: 1 },
    ],
    inbound_links_distribution: [
      { range: '0-10', count: 28 },
      { range: '11-50', count: 12 },
      { range: '51-200', count: 6 },
      { range: '200+', count: 2 },
    ],
    js_files_distribution: [
      { range: '0-5', count: 30 },
      { range: '6-10', count: 12 },
      { range: '10+', count: 6 },
    ],
    js_size_distribution: [
      { range: '<50KB', count: 24 },
      { range: '50-200KB', count: 16 },
      { range: '>200KB', count: 8 },
    ],
    market_traffic: { direct: 1800, organic: 2400, organic_pct: '57%', paid: 500, social: 600, social_pct: '14%', other: 400, other_pct: '10%' },
  };
}

// ── Performance data (perf_data in profile) ──
function getDemoPerfData(cleanUrl) {
  return {
    brand_name: 'UseWok',
    url: cleanUrl,
    analyzed_at: new Date().toISOString(),
    share_of_voice: {
      your_brand: { name: 'UseWok', voice_share_pct: 18, voice_share_delta: 4, favorable_pct: 72, favorable_delta: 6, color: '#7C3AED' },
      competitors: [
        { name: 'Profound', voice_share_pct: 32, voice_share_delta: 2, favorable_pct: 68, favorable_delta: 1, color: '#F97316' },
        { name: 'AthenaHQ', voice_share_pct: 24, voice_share_delta: -1, favorable_pct: 65, favorable_delta: -2, color: '#3B8BEB' },
        { name: 'Otterly.ai', voice_share_pct: 16, voice_share_delta: 3, favorable_pct: 60, favorable_delta: 4, color: '#10B981' },
      ],
      other_pct: 10,
      insight_type: 'behind',
      insight_title: 'Falling behind Profound',
      insight_text: 'Profound has nearly double your AI share of voice. Focus on FAQ schema and author bios to close the gap.',
      top_competitor: 'Profound',
      donut_data: [
        { label: 'Profound', pct: 32, color: '#F97316', delta: 2 },
        { label: 'AthenaHQ', pct: 24, color: '#3B8BEB', delta: -1 },
        { label: 'UseWok', pct: 18, color: '#7C3AED', delta: 4 },
        { label: 'Otterly.ai', pct: 16, color: '#10B981', delta: 3 },
        { label: 'Other', pct: 10, color: '#D1D5DB', delta: 0 },
      ],
    },
    growth_factors: {
      top_insight: { factor: 'Pricing transparency', count: 14, insight: 'Competitors with visible pricing get cited 2× more often in AI comparison queries. Adding Product schema to your pricing page would close this gap.' },
      factors: [
        { name: 'Pricing transparency', your_brand_count: 4, competitors: [{ name: 'Profound', count: 14, is_leader: true }, { name: 'AthenaHQ', count: 8, is_leader: false }], total_mentions: 26, branded_mentions: 4 },
        { name: 'Feature comparison', your_brand_count: 6, competitors: [{ name: 'Profound', count: 12, is_leader: true }, { name: 'AthenaHQ', count: 9, is_leader: false }], total_mentions: 27, branded_mentions: 6 },
        { name: 'Customer reviews', your_brand_count: 3, competitors: [{ name: 'Otterly.ai', count: 11, is_leader: true }, { name: 'Profound', count: 7, is_leader: false }], total_mentions: 21, branded_mentions: 3 },
        { name: 'Ease of use', your_brand_count: 8, competitors: [{ name: 'AthenaHQ', count: 10, is_leader: true }, { name: 'Profound', count: 6, is_leader: false }], total_mentions: 24, branded_mentions: 8 },
        { name: 'AI engine coverage', your_brand_count: 9, competitors: [{ name: 'Profound', count: 11, is_leader: true }, { name: 'Otterly.ai', count: 5, is_leader: false }], total_mentions: 25, branded_mentions: 9 },
        { name: 'Free trial', your_brand_count: 5, competitors: [{ name: 'Otterly.ai', count: 9, is_leader: true }, { name: 'Profound', count: 7, is_leader: false }], total_mentions: 21, branded_mentions: 5 },
        { name: 'Setup speed', your_brand_count: 7, competitors: [{ name: 'AthenaHQ', count: 8, is_leader: true }, { name: 'Profound', count: 5, is_leader: false }], total_mentions: 20, branded_mentions: 7 },
        { name: 'Reporting depth', your_brand_count: 6, competitors: [{ name: 'Profound', count: 10, is_leader: true }, { name: 'AthenaHQ', count: 7, is_leader: false }], total_mentions: 23, branded_mentions: 6 },
      ],
      brands_in_matrix: [
        { name: 'UseWok', color: '#7C3AED' },
        { name: 'Profound', color: '#F97316' },
        { name: 'AthenaHQ', color: '#3B8BEB' },
        { name: 'Otterly.ai', color: '#10B981' },
      ],
    },
    strategy: {
      competitor_comparisons: [
        { competitor_name: 'Profound', competitor_color: '#F97316', insight_type: 'behind', insight_title: '14 pts behind on share of voice', insight_text: 'Profound leads with 32% vs your 18%. Their FAQ schema and author bios give them a structural edge.', your_voice_share: 18, competitor_voice_share: 32, your_favorable: 72, competitor_favorable: 68, your_voice_delta: 4, competitor_voice_delta: 2, your_favorable_delta: 6, competitor_favorable_delta: 1, growth_factors: [{ name: 'Pricing transparency', your_count: 4, competitor_count: 14, competitor_is_leader: true }, { name: 'Feature comparison', your_count: 6, competitor_count: 12, competitor_is_leader: true }, { name: 'AI engine coverage', your_count: 9, competitor_count: 11, competitor_is_leader: true }] },
        { competitor_name: 'AthenaHQ', competitor_color: '#3B8BEB', insight_type: 'behind', insight_title: '6 pts behind on share of voice', insight_text: 'AthenaHQ has 24% vs your 18%. Their growth is slowing — this is your chance to catch up.', your_voice_share: 18, competitor_voice_share: 24, your_favorable: 72, competitor_favorable: 65, your_voice_delta: 4, competitor_voice_delta: -1, your_favorable_delta: 6, competitor_favorable_delta: -2, growth_factors: [{ name: 'Ease of use', your_count: 8, competitor_count: 10, competitor_is_leader: true }, { name: 'Setup speed', your_count: 7, competitor_count: 8, competitor_is_leader: true }, { name: 'Reporting depth', your_count: 6, competitor_count: 7, competitor_is_leader: true }] },
      ],
      strategic_levers: [
        { priority: 'urgent', title: 'Add FAQ schema to your 10 most-visited blog posts', body: 'Profound gets cited 2× more on informational queries because they have structured FAQs. This is the single highest-impact change you can make this week.', recommendations: ['Identify your 10 most-visited blog posts', 'Write 5-6 Q&A pairs for each article', 'Add FAQPage JSON-LD schema to each post', 'Submit updated URLs to Google Search Console'] },
        { priority: 'short_term', title: 'Add Product schema to your pricing page', body: 'AI engines can\'t surface your plans in comparison queries without structured product data. This takes 30 minutes and unlocks pricing-related citations.', recommendations: ['Go to your /pricing page', 'Add Product + Offer JSON-LD for each plan', 'Include plan name, price, and description', 'Test with Google\'s Rich Results validator'] },
        { priority: 'medium_term', title: 'Build author authority with Person schema', body: 'Claude weighs author trust heavily. Adding author bios with Person schema could boost your citation rate by 20-30% over the next quarter.', recommendations: ['Create an /author page for each blog writer', 'Add a bio, photo, and social links', 'Add Person JSON-LD schema to author pages', 'Link blog posts to author pages with rel="author"'] },
      ],
    },
  };
}

// ── Competitor entity records ──
function getDemoCompetitors(userId, cleanUrl) {
  const promptsJson = JSON.stringify([
    { prompt: 'Best AI visibility tools 2026', engines: { chatgpt: 'Profound', gemini: 'Profound', claude: 'AthenaHQ' } },
    { prompt: 'How to track brand mentions in ChatGPT', engines: { chatgpt: 'UseWok', gemini: 'Profound', claude: null } },
    { prompt: 'AEO platform comparison', engines: { chatgpt: 'Profound', gemini: 'AthenaHQ', claude: 'Otterly.ai' } },
    { prompt: 'Tool to measure AI search visibility', engines: { chatgpt: 'UseWok', gemini: 'UseWok', claude: 'Profound' } },
  ]);
  return [
    { user_id: userId, site_url: cleanUrl, name: 'UseWok', domain: 'usewok.com', is_you: true, referral_pct: 18, authority_pct: 22, referral_cited: 7, referral_total: 40, authority_cited: 5, authority_total: 24, trend_90d: 'rising', synthesis: 'UseWok is mentioned in ~18% of AI recommendation prompts in the AI visibility category. Growing steadily but still behind Profound.', positioning: 'Positioned as an all-in-one AI visibility platform with strong French market presence.', prompts_json: promptsJson, news_json: '[]', analyzed_at: new Date().toISOString() },
    { user_id: userId, site_url: cleanUrl, name: 'Profound', domain: 'profound.com', is_you: false, referral_pct: 32, authority_cited: 12, authority_total: 24, referral_cited: 13, referral_total: 40, authority_pct: 50, trend_90d: 'rising', synthesis: 'Profound leads AI visibility tool recommendations with 32% share of voice. Strong FAQ schema and author bios drive citations.', positioning: 'Enterprise-focused AEO platform with deep analytics. Known for comprehensive reporting.', prompts_json: promptsJson, news_json: '[]', analyzed_at: new Date().toISOString() },
    { user_id: userId, site_url: cleanUrl, name: 'AthenaHQ', domain: 'athenahq.com', is_you: false, referral_pct: 24, authority_pct: 33, referral_cited: 10, referral_total: 40, authority_cited: 8, authority_total: 24, trend_90d: 'flat', synthesis: 'AthenaHQ holds 24% share. Growth has plateaued — an opportunity for UseWok to overtake.', positioning: 'Mid-market AI visibility tool. Strong on ease of use but limited engine coverage.', prompts_json: promptsJson, news_json: '[]', analyzed_at: new Date().toISOString() },
    { user_id: userId, site_url: cleanUrl, name: 'Otterly.ai', domain: 'otterly.ai', is_you: false, referral_pct: 16, authority_pct: 21, referral_cited: 6, referral_total: 40, authority_cited: 5, authority_total: 24, trend_90d: 'rising', synthesis: 'Otterly.ai is gaining traction with 16% share. Strong customer reviews drive word-of-mouth citations.', positioning: 'Niche AI search monitoring tool. Popular for its simplicity and free trial.', prompts_json: promptsJson, news_json: '[]', analyzed_at: new Date().toISOString() },
  ];
}

// ── ActionTask entity records ──
function getDemoTasks(userId, cleanUrl) {
  const mk = (title, type, source, impact, effort, score) => ({
    user_id: userId, site_url: cleanUrl, action_title: title, status: 'todo',
    note: JSON.stringify({ type, source, impact_label: impact, effort, impact_score: score }),
  });
  return [
    mk('Add FAQPage JSON-LD schema to blog posts', 'Content', 'What AI Says About Me', 'High', 'Low', 85),
    mk('Add Product schema to /pricing page', 'Technical', 'Audit', 'Medium', 'Low', 65),
    mk('Create author bios with Person schema', 'Content', 'What AI Says About Me', 'Medium', 'Medium', 60),
    mk('Shorten homepage title to ≤60 characters', 'Technical', 'Audit', 'Low', 'Low', 40),
    mk('Compress images on slow-loading pages', 'Technical', 'Audit', 'Medium', 'Low', 55),
    mk('Add alt text to images missing descriptions', 'Content', 'Audit', 'Low', 'Low', 35),
  ];
}

// ── BrandPerception entity records ──
function getDemoBrandPerception(userId, cleanUrl) {
  const brandPrompts = JSON.stringify([
    { text: 'What are the best AI visibility platforms in 2026?', type: 'narrative', cited: true, answer: 'ChatGPT recommends Profound, AthenaHQ, and UseWok as leading AI visibility platforms.', lang: 'en' },
    { text: 'Tool to track brand mentions in ChatGPT', type: 'narrative', cited: true, answer: 'Gemini mentions UseWok as a tool for tracking brand mentions across AI engines.', lang: 'en' },
    { text: 'How to improve AEO for my website?', type: 'authority', cited: false, answer: 'Claude suggests adding structured data and FAQ schema, but doesn\'t cite UseWok specifically.', lang: 'en' },
    { text: 'AI search visibility monitoring tools', type: 'narrative', cited: true, answer: 'Perplexity cites UseWok and Profound as popular AI search visibility monitoring tools.', lang: 'en' },
    { text: 'What is GEO (Generative Engine Optimization)?', type: 'authority', cited: false, answer: 'Gemini explains GEO as optimizing for AI-generated answers, citing Search Engine Land and Ahrefs.', lang: 'en' },
    { text: 'Best platform for AEO tracking', type: 'narrative', cited: true, answer: 'ChatGPT recommends UseWok for AEO tracking with its multi-engine coverage.', lang: 'en' },
    { text: 'How does ChatGPT choose which brands to recommend?', type: 'authority', cited: false, answer: 'Claude explains recommendation factors but doesn\'t cite UseWok.', lang: 'en' },
    { text: 'Compare UseWok vs Profound', type: 'narrative', cited: true, answer: 'Perplexity compares both platforms, noting UseWok\'s French market strength vs Profound\'s enterprise focus.', lang: 'en' },
  ]);
  const brandRecos = JSON.stringify([
    { title: 'Add FAQPage schema to blog posts', description: 'Your blog has great content but no structured FAQs. Adding FAQPage schema would make Perplexity and Google cite you in answer boxes.', impact: 'High', effort: 'Low', type: 'Content' },
    { title: 'Build author authority pages', description: 'Create dedicated author pages with bios and Person schema. Claude weighs author trust heavily when citing sources.', impact: 'Medium', effort: 'Medium', type: 'Content' },
    { title: 'Get listed on AI tool comparison sites', description: 'Your competitors are cited on G2 and Capterra comparison pages. Getting listed would boost your authority citations.', impact: 'Medium', effort: 'Medium', type: 'Off-site' },
    { title: 'Publish case studies with metrics', description: 'AI engines love citing concrete numbers. Case studies with real results get picked up as authority sources.', impact: 'High', effort: 'Medium', type: 'Content' },
  ]);
  const recoPrompts = JSON.stringify([
    { text: 'Why isn\'t my brand recommended by ChatGPT?', type: 'narrative', cited: true, answer: 'ChatGPT may not know your brand well. Adding structured data and getting mentioned on authoritative sites helps.', lang: 'en' },
    { text: 'How to get cited by Perplexity?', type: 'authority', cited: true, answer: 'Perplexity cites sources with FAQ schema and clear authorship. Structure your content for direct answers.', lang: 'en' },
  ]);
  const recoRecos = JSON.stringify([
    { title: 'Structure content for AI extraction', description: 'Use clear headings, concise paragraphs, and FAQ sections so AI engines can extract and cite your content directly.', impact: 'High', effort: 'Low', type: 'Content' },
    { title: 'Earn mentions on authoritative sites', description: 'Get featured in industry blogs, comparison articles, and review sites. AI engines cite brands that appear on trusted sources.', impact: 'High', effort: 'High', type: 'Off-site' },
    { title: 'Add Organization schema', description: 'Make sure your homepage has Organization JSON-LD so AI engines know who you are and what you do.', impact: 'Medium', effort: 'Low', type: 'Technical' },
  ]);
  return [
    { user_id: userId, site_url: cleanUrl, kind: 'brand', score_narrative: 62, score_authority: 45, sentiment_positive: 72, sentiment_neutral: 25, sentiment_negative: 3, prompts_json: brandPrompts, recommendations_json: brandRecos, analyzed_at: new Date().toISOString() },
    { user_id: userId, site_url: cleanUrl, kind: 'reco', score_narrative: 58, score_authority: 42, sentiment_positive: 68, sentiment_neutral: 30, sentiment_negative: 2, prompts_json: recoPrompts, recommendations_json: recoRecos, analyzed_at: new Date().toISOString() },
  ];
}

// ── SiteAudit entity record ──
function getDemoSiteAudit(userId, cleanUrl) {
  return {
    user_id: userId, site_url: cleanUrl, status: 'done', score_website: 74, pages_analyzed: 48,
    agents_json: JSON.stringify({ crawler: 'done', seo: 'done', performance: 'done', ai_readiness: 'done' }),
    pages_json: JSON.stringify([
      { url: 'https://usewok.com', depth: 1, status: 200, issues: 1 },
      { url: 'https://usewok.com/pricing', depth: 1, status: 200, issues: 0 },
      { url: 'https://usewok.com/blog', depth: 1, status: 200, issues: 0 },
      { url: 'https://usewok.com/about', depth: 1, status: 200, issues: 1 },
    ]),
    results_json: JSON.stringify({ site_health_score: 74, crawlability_score: 82, ai_readiness_score: 68 }),
  };
}

// ── Main entry: seeds all entities + returns scan result ──
export async function runDemoScan(cleanUrl, userId) {
  const scanResult = getDemoScanResult(cleanUrl);
  const overview = getDemoOverview(cleanUrl);
  const auditData = getDemoAuditData(cleanUrl);
  const perfData = getDemoPerfData(cleanUrl);

  // Embed overview/audit/perf in the scan result JSON
  scanResult.overview_data = overview;
  scanResult.overview_analyzed_at = new Date().toISOString();
  scanResult.audit_data = auditData;
  scanResult.audit_analyzed_at = new Date().toISOString();
  scanResult.perf_data = perfData;
  scanResult.perf_analyzed_at = new Date().toISOString();

  // ── Store the full demo data in localStorage (unlimited size) ──
  // Only a tiny reference goes into brand_keywords to avoid breaking the entity.
  const lsKey = `wok_demo_${userId}_${cleanUrl.replace(/[^a-z0-9]/gi, '_')}`;
  try {
    localStorage.setItem(lsKey, JSON.stringify(scanResult));
  } catch (e) {
    console.error('Failed to store demo data in localStorage', e);
  }

  // Small reference JSON for brand_keywords — getProfileData detects _demo and loads from localStorage
  const brandKeywords = JSON.stringify({
    _demo: true,
    _ls_key: lsKey,
    business_name: scanResult.business_name,
    overall_score: scanResult.overall_score,
    ai_visibility_score: scanResult.ai_visibility_score,
    message_clarity_score: scanResult.message_clarity_score,
    commercial_presence_score: scanResult.commercial_presence_score,
    overview_analyzed_at: scanResult.overview_analyzed_at,
    audit_analyzed_at: scanResult.audit_analyzed_at,
    perf_analyzed_at: scanResult.perf_analyzed_at,
  });

  // ── Create / update BusinessProfile ──
  const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: userId }).catch(() => []);
  const existing = profiles.find(p => p.site_url === cleanUrl);
  const fields = {
    site_url: cleanUrl,
    identity_name: scanResult.business_name,
    identity_industry: scanResult.business_type,
    identity_city: scanResult.city,
    score_ai_visibility: scanResult.ai_visibility_score,
    score_message_clarity: scanResult.message_clarity_score,
    score_commercial_signal: scanResult.commercial_presence_score,
    score_overall: scanResult.overall_score,
    last_scan: new Date().toISOString(),
    scan_in_progress: false,
    brand_keywords: brandKeywords,
    active: true,
  };
  if (existing) {
    await base44.entities.BusinessProfile.update(existing.id, fields);
  } else {
    await base44.entities.BusinessProfile.create({ ...fields, created_by_id: userId });
  }

  // ── Seed Competitors (idempotent) ──
  const existingComps = await base44.entities.Competitor.filter({ user_id: userId, site_url: cleanUrl }).catch(() => []);
  if (existingComps.length === 0) {
    await base44.entities.Competitor.bulkCreate(getDemoCompetitors(userId, cleanUrl));
  }

  // ── Seed ActionTasks (idempotent) ──
  const existingTasks = await base44.entities.ActionTask.filter({ user_id: userId, site_url: cleanUrl }).catch(() => []);
  if (existingTasks.length === 0) {
    await base44.entities.ActionTask.bulkCreate(getDemoTasks(userId, cleanUrl));
  }

  // ── Seed BrandPerception (idempotent) ──
  const existingBP = await base44.entities.BrandPerception.filter({ user_id: userId, site_url: cleanUrl }).catch(() => []);
  if (existingBP.length === 0) {
    await base44.entities.BrandPerception.bulkCreate(getDemoBrandPerception(userId, cleanUrl));
  }

  // ── Seed SiteAudit (idempotent) ──
  const existingSA = await base44.entities.SiteAudit.filter({ user_id: userId, site_url: cleanUrl }).catch(() => []);
  if (existingSA.length === 0) {
    await base44.entities.SiteAudit.create(getDemoSiteAudit(userId, cleanUrl));
  }

  return scanResult;
}