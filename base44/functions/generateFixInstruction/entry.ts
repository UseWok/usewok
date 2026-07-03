import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function normalizeKey(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9àâäéèêëîïôùûüç\s]/g, '').replace(/\s+/g, '_').slice(0, 80);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const issueProblem = body.issue || body.issueProblem || '';
    const businessProfile = body.profile || body.businessProfile || {};
    const siteUrl = businessProfile.site_url || '';
    const industry = businessProfile.business_type || businessProfile.identity_industry || '';
    const businessName = businessProfile.business_name || businessProfile.identity_name || '';

    // ── User profile ──
    let userProfile = body.user_profile || {};
    if (!userProfile.tech_level && businessProfile.user_preferences) {
      try {
        const prefs = typeof businessProfile.user_preferences === 'string'
          ? JSON.parse(businessProfile.user_preferences)
          : businessProfile.user_preferences;
        userProfile = { ...userProfile, ...prefs };
      } catch {}
    }
    if (!userProfile.tech_level && siteUrl) {
      const profile = await base44.entities.BusinessProfile.filter({ site_url: siteUrl }).catch(() => []);
      if (profile && profile.length > 0 && profile[0].user_preferences) {
        try {
          const prefs = JSON.parse(profile[0].user_preferences);
          userProfile = { ...userProfile, ...prefs };
        } catch {}
      }
    }

    const techLevel = userProfile.tech_level || 'no_code';

    const issueKey = normalizeKey(issueProblem);
    const cacheKey = `${issueKey}__${techLevel}`;

    // ── 1. User cache ──
    const userCache = await base44.entities.UserFixCache.filter({
      user_id: user.id,
      issue_key: cacheKey,
    }).catch(() => []);

    if (userCache && userCache.length > 0) {
      const cached = userCache[0];
      let steps = [];
      try { steps = JSON.parse(cached.steps || '[]'); } catch {}
      return Response.json({
        summary: cached.summary,
        steps,
        prompt: cached.prompt || null,
        explanation: cached.explanation || null,
        time_estimate: cached.time_estimate,
        type: cached.fix_type || 'solo',
        profile_type: cached.profile_type || techLevel,
        from_cache: true,
      });
    }

    // ── 2. Global cache (FixLibrary) ──
    const globalCache = await base44.asServiceRole.entities.FixLibrary.filter({ issue_key: cacheKey }).catch(() => []);
    if (globalCache && globalCache.length > 0) {
      const match = globalCache[0];
      let steps = [];
      try { steps = JSON.parse(match.steps || '[]'); } catch {}

      base44.entities.UserFixCache.create({
        user_id: user.id,
        issue_key: cacheKey,
        site_url: siteUrl,
        summary: match.summary,
        steps: match.steps,
        prompt: match.prompt || null,
        explanation: match.explanation || null,
        time_estimate: match.time_estimate,
        fix_type: match.type || 'solo',
        profile_type: techLevel,
      }).catch(() => {});

      base44.asServiceRole.entities.FixLibrary.update(match.id, { use_count: (match.use_count || 1) + 1 }).catch(() => {});

      return Response.json({
        summary: match.summary,
        steps,
        prompt: match.prompt || null,
        explanation: match.explanation || null,
        time_estimate: match.time_estimate,
        type: match.type || 'solo',
        profile_type: techLevel,
        from_cache: true,
      });
    }

    // ── 3. Generate via LLM ──
    const isNoCode = techLevel === 'no_code';
    const isAiNoCode = techLevel === 'ai_nocode';
    const isDeveloper = techLevel === 'developer';

    const profileLabel = isNoCode ? 'NO-CODE' : isAiNoCode ? 'AI HELPER' : 'DEVELOPER';

    let profileInstructions = '';
    let requiredFields = ['summary', 'time_estimate'];

    if (isNoCode || isAiNoCode) {
      const platformHint = isNoCode
        ? "The user is on Wix/WordPress/Squarespace. They CLICK, they NEVER code. The prompt result must be content ready to paste into a visual editor."
        : "The user uses ChatGPT/Claude as an assistant. They copy-paste the prompt, then paste the response into their site.";

      profileInstructions = `
INSTRUCTIONS - GENERATING THE "prompt" FIELD (CRITICAL FIELD - 10X)
====================================================================
You generate the "prompt" field: an EXPERT prompt ready to copy-paste into ChatGPT or Claude.

${platformHint}

PHILOSOPHY: ZERO MENTAL LOAD, IMMEDIATE RESULT.
The user copies the prompt, pastes it into ChatGPT/Claude, copies the response, pastes it into their site. END OF STORY.
The AI receiving the prompt must produce a PERFECT result on the first try. No iteration, no adjustment.

THE PROMPT YOU GENERATE MUST BE STRUCTURED LIKE A PROFESSIONAL BRIEF:

══════════════════════════════════════════════════
MANDATORY STRUCTURE OF THE GENERATED PROMPT (EVERY SECTION IS CRITICAL)
══════════════════════════════════════════════════

The prompt you generate MUST contain these blocks IN THIS ORDER:

1. ROLE (1 line)
   You are an expert in [specific domain related to the problem], specialist [sub-specialty] for [platforms: Wix, WordPress, Squarespace if no_code].
   Assign a HYPER-specific role, not generic.

2. CONTEXT (2-3 lines)
   My business is called "${businessName}" and the URL is ${siteUrl}.
   CONTEXT: [specific problem: "${issueProblem}"]
   Pre-filled with "${businessName}", "${siteUrl}", "${industry}".

3. TASK (3-5 lines)
   Generate [NUMBER] strict sections that are directly copy-pasteable:
   1) [section 1 with exact description]
   2) [section 2 with exact description]
   3) [section 3 with exact description] (if applicable)
   Break the task into NUMBERED sections with clear deliverables.

4. FORMAT AND TONE EXAMPLE (2-4 lines)
   - Example [format]: [show a mini-example of the expected format]
   - Tone: professional but warm, expert but accessible, direct, no jargon.
   Give a CONCRETE example of the format, not a vague description.

5. PRECISE CONSTRAINTS (5-8 bullet points)
   - ZERO commentary outside the requested sections.
   - [Exact quantity constraint: "exactly 3 points", "exactly 4 steps", "5-8 lines"]
   - [Format constraint: "plain text", "HTML with <h2>, <p>, <ul> tags"]
   - [Content constraint: "include at least one quantified benefit"]
   - ZERO placeholders. Include "${businessName}" and "${siteUrl}" verbatim.
   Each constraint is a bullet with a MEASURABLE and VERIFIABLE requirement.

6. FINAL OUTPUT FORMAT (2-3 lines)
   - First [section 1] then [section 2] then [section 3]. Everything must be copy-pasteable as-is.
   Then paste the response into [EXACT location on the site: "the Services section of ${siteUrl}"]
   Specify the EXACT order of sections and where to paste the result.

══════════════════════════════════════════════════

ABSOLUTE RULES FOR EVERY GENERATED PROMPT:

A. EXACT QUANTITIES — NEVER VAGUE:
   - NEVER "several", "a few", "multiple paragraphs" → ALWAYS "3 paragraphs", "5 benefits", "4 steps"
   - NEVER "include your advantages" → ALWAYS "include 4 competitive advantages for the ${industry} industry"
   - Every constraint must be quantified and verifiable.

B. NUMBERED SECTIONS — PRO STRUCTURE:
   - If the task produces multiple deliverables (e.g.: text + guide + explanation), divide into sections 1), 2), 3)
   - Each section has a clear purpose and precise output format.
   - The AI knows EXACTLY what to produce in each section.

C. PRECISE CONSTRAINTS — DEDICATED SECTION:
   - The prompt MUST contain a "PRECISE CONSTRAINTS" section with bullet points
   - Each bullet is a measurable rule: exact number, exact format, mandatory content
   - No "be creative" — concrete and verifiable instructions.

D. EXPLICIT OUTPUT FORMAT:
   - Specify EXACTLY: HTML? Plain text? JSON? How many lines? How many words?
   - "HTML ready to paste (<h2>, <p>, <ul>, <li> tags)"
   - "Plain text, 5-8 lines, no tags"
   - The AI must NEVER guess the format.

E. ZERO COMMENTARY OUTSIDE DELIVERABLES:
   - The prompt must require: "ZERO commentary outside the requested sections"
   - No "Here is the requested content:", no explanation, no introduction
   - Just the deliverable, clean, spotless.

F. WOW EFFECT — PREMIUM CONTENT:
   - Ask for a CTA at the end: "Contact us", "Discover", "Book now"
   - Ask for QUANTIFIED benefits: "+30% indexing", "save 2h/week"
   - Ask for vocabulary adapted to the ${industry} industry
   - Ask for visual structure: titles, subtitles, bullet lists
   - The result must impress the user.

G. PRE-FILLED INFO — NEVER HOLE-FILLED PLACEHOLDERS:
   - "${businessName}" → always pre-filled verbatim
   - "${siteUrl}" → always pre-filled verbatim
   - "${industry}" → always pre-filled as context
   - "${issueProblem}" → always pre-filled as context
   - Only [PHONE_NUMBER], [POSTAL_ADDRESS], [BUSINESS_HOURS] are accepted (private info)

H. STRUCTURE OF THE "prompt" FIELD:
   - ALWAYS start with: "Copy this into ChatGPT or Claude:\\n\\n"
   - Then the full structured prompt (15-40 lines depending on complexity)
   - ALWAYS end with: "\\n\\nThen paste the response into [EXACT location] of ${siteUrl}"

══════════════════════════════════════════════════
EXAMPLE OF A GOOD GENERATED PROMPT (adapt to the problem, don't copy):
══════════════════════════════════════════════════

Copy this into ChatGPT or Claude:

You are an expert in AI Visibility Optimization (AEO), specialist in robots.txt and no-code workflows for Wix, WordPress and Squarespace. My site is called "${businessName}" and the URL is ${siteUrl}.

CONTEXT: ${issueProblem}

TASK: Generate 3 strict sections that are directly copy-pasteable:
1) A "robots.txt" block in plain text ready to replace the current one. Must allow all AI engines, point to the sitemap, protect only /wp-admin/ and /private/. Include Sitemap: ${siteUrl}/sitemap.xml. No comments.
2) An HTML section (<h2>, <p>, <ul> tags) explaining in 3 clear points what changes and why it improves AI indexing (quantified benefits).
3) Three mini step-by-step guides (HTML) — one for Wix, one for WordPress, one for Squarespace — each with 4 steps: click, paste, save, verify.

FORMAT AND TONE EXAMPLE:
- Example robots.txt (plain text): User-agent: * / Allow: / / Disallow: /private/ / Sitemap: ${siteUrl}/sitemap.xml
- Tone: professional but warm, expert but accessible, direct, no jargon.

PRECISE CONSTRAINTS:
- ZERO commentary outside the 3 requested sections.
- robots.txt: plain text, exactly 5-8 lines.
- Explanation: exactly 3 points (<li>), at least one quantified benefit (+30% indexing in 4 weeks).
- Each guide: exactly 4 steps in <ol> with bold menu items (Dashboard > Settings > SEO).
- End with an HTML CTA linking to ${siteUrl}/contact.
- ZERO placeholders. Include "${businessName}" and "${siteUrl}" verbatim.

FINAL OUTPUT FORMAT:
- First robots.txt in plain text, then HTML "Explanations", then HTML "Guides". Everything copy-pasteable as-is.

Then paste the response into the 'Custom robots.txt file' area (Settings > SEO > Robots.txt) of ${siteUrl}

══════════════════════════════════════════════════
END OF EXAMPLE.
============================================================
`;
      requiredFields = ['summary', 'prompt', 'time_estimate'];
    } else {
      profileInstructions = `
INSTRUCTIONS - GENERATING THE "explanation" FIELD (CRITICAL FIELD - 10X)
=========================================================================
You generate the "explanation" field: an expert technical response for a developer.

PHILOSOPHY: ZERO MENTAL LOAD, WOW EFFECT.
The developer reads the explanation, copies the code, pastes it, and it works. END OF STORY.
They should NEVER have to search Google, open docs, or guess anything.

THE EXPLANATION MUST CONTAIN THESE 6 MANDATORY SECTIONS:

1. ROOT CAUSE (2-3 sentences)
   - Why this problem exists technically
   - Precise reference to the spec/RFC/doc (e.g.: "schema.org/LocalBusiness requires...", "Google AEO guidelines state...")
   - Be hyper-specific, not generic

2. DETAILED AI IMPACT (2-3 sentences)
   - How it affects EACH LLM:
     * ChatGPT: entity recognition, knowledge graph parsing
     * Gemini: real-time web crawling, structured data extraction
     * Claude: context window parsing, trust signal evaluation
     * Perplexity: citation sourcing, fact verification
   - Say exactly what the AI cannot do because of this problem

3. STEP-BY-STEP SOLUTION
   - The EXACT files to modify (e.g.: "In the <head> of index.html...", "In the robots.txt file at the root...")
   - The lines/tags concerned
   - The order of operations
   - If backend: the endpoints/APIs concerned

4. COMPLETE READY-TO-PASTE CODE
   - The EXACT code with "${businessName}" and "${siteUrl}" pre-filled
   - No "adapt this template" — the final, validated, ready-to-paste code
   - If JSON-LD: the COMPLETE <script type="application/ld+json"> block with all required properties
   - If meta tag: the complete tag with pre-filled content
   - If robots.txt/sitemap.xml: the complete file content
   - Indent properly, comment key sections

5. VERIFICATION (1-2 sentences)
   - How to verify it works:
     * Test URL (e.g.: "search.google.com/test/rich-results")
     * curl command or DevTools (e.g.: "curl -s ${siteUrl} | grep 'application/ld+json'")
     * What you should see if it's valid

6. COMMON PITFALLS (1-2 sentences)
   - Frequent mistakes with this fix
   - How to avoid them
   - Edge cases (e.g.: "If your site is a SPA, the JSON-LD must be in the initial HTML, not injected via JS")

ABSOLUTE RULES:
- ENGLISH, expert but accessible tone — not condescending
- 300-600 words — DENSE in information, zero fluff, zero filler
- Include "${businessName}" and "${siteUrl}" in the explanation AND the code
- If JSON-LD: give the COMPLETE and VALIDATED code — not a reference, not a skeleton
- Cite standard specs (schema.org, W3C, Google Search Central) with links if relevant
- ZERO hole-filled placeholders — everything is concrete and pre-filled
- The code must be directly copy-pasteable (no "here's the template", just the code)
- WOW EFFECT: the developer should think "wow, this is exactly what I needed"
=========================================================================
`;
      requiredFields = ['summary', 'explanation', 'time_estimate'];
    }

    const devOrPromptLine = (isNoCode || isAiNoCode)
      ? '4. "prompt" - The expert RTCEF prompt generated according to the instructions above.'
      : '4. "explanation" - The expert technical explanation generated according to the instructions above.';

    const prompt = `You are a world-class AEO (AI Engine Optimization) Consultant — premium service, zero errors, luxury quality, wow effect.

MISSION
=======
You create a CUSTOM fix guide for "${businessName}", a business in the "${industry}" industry whose website is ${siteUrl}.

The user has the technical profile: ${profileLabel}
The problem to fix: "${issueProblem}"

${profileInstructions}

MANDATORY JSON FIELDS
=====================

1. "summary" - 1 punchy sentence + 1 key number.
   Structure: [WHY IT'S BLOCKED] + [QUANTIFIED IMPACT].
   Example: "AI engines can't find your contact info — you're losing 40% of 'near me' local searches."
   Forbidden: "It is important to...", "You should...", any generic fluff.

2. "time_estimate" - Realistic time to execute the fix.
   no_code: "10 min" / "20 min" / "30 min"
   ai_nocode: "5 min" / "15 min" / "30 min"
   developer: "30 min" / "1-2h" / "1 day"

3. "type" - "solo" (doable without help) or "with help" (requires a pro).

${devOrPromptLine}

LUXURY QUALITY — CHECKLIST BEFORE RESPONDING
============================================
- The prompt/explanation includes "${businessName}" and "${siteUrl}" pre-filled
- ZERO hole-filled placeholders like [FEATURE_LIST], [NUMBER], [TYPE], [YOUR_ADVANTAGES]
- The only [BRACKETS] accepted: strictly private info (phone, address, hours)
- The AI has TOTAL AUTONOMY to invent content, numbers, angles
- The result is IMMEDIATELY COPY-PASTEABLE — zero preparation, zero mental load
- The tone is professional, direct, confident — no "maybe", "you might want to"
- Flawless English — zero errors
- WOW EFFECT: the result must impress the user with its quality and relevance

Respond ONLY with the JSON. No text outside the JSON.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          steps: { type: 'array', items: { type: 'string' } },
          prompt: { type: 'string' },
          explanation: { type: 'string' },
          time_estimate: { type: 'string' },
          type: { type: 'string' },
        },
        required: requiredFields,
      },
    });

    // ── 4. Save ──
    const stepsJson = JSON.stringify(result.steps || []);

    await Promise.all([
      base44.entities.UserFixCache.create({
        user_id: user.id,
        issue_key: cacheKey,
        site_url: siteUrl,
        summary: result.summary || '',
        steps: stepsJson,
        prompt: result.prompt || null,
        explanation: result.explanation || null,
        time_estimate: result.time_estimate || '',
        fix_type: result.type || 'solo',
        profile_type: techLevel,
      }).catch((e) => console.error('[cache_save_user]', e)),

      base44.asServiceRole.entities.FixLibrary.create({
        issue_key: cacheKey,
        issue_text: issueProblem,
        industry,
        summary: result.summary || '',
        steps: stepsJson,
        prompt: result.prompt || null,
        explanation: result.explanation || null,
        time_estimate: result.time_estimate || '',
        type: result.type || 'solo',
        use_count: 1,
      }).catch((e) => console.error('[cache_save_library]', e)),
    ]);

    return Response.json({ ...result, profile_type: techLevel });
  } catch (error) {
    console.error('[generateFixInstruction]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});