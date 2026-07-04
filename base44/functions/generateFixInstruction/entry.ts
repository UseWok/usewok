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

    // ── User profile (single fast lookup) ──
    let techLevel = 'no_code';
    if (businessProfile.user_preferences) {
      try {
        const prefs = typeof businessProfile.user_preferences === 'string'
          ? JSON.parse(businessProfile.user_preferences)
          : businessProfile.user_preferences;
        if (prefs.tech_level) techLevel = prefs.tech_level;
      } catch {}
    }

    const issueKey = normalizeKey(issueProblem);
    const cacheKey = `${issueKey}__${techLevel}`;

    // ── Parallel cache check (user + global) — 10X faster on cache hit ──
    const [userCache, globalCache] = await Promise.all([
      base44.entities.UserFixCache.filter({ user_id: user.id, issue_key: cacheKey }).catch(() => []),
      base44.asServiceRole.entities.FixLibrary.filter({ issue_key: cacheKey }).catch(() => []),
    ]);

    const cached = (userCache && userCache[0]) || (globalCache && globalCache[0]);
    if (cached) {
      let steps = [];
      try { steps = JSON.parse(cached.steps || '[]'); } catch {}
      const isFromGlobal = !userCache || !userCache[0];

      // Backfill user cache from global (fire-and-forget)
      if (isFromGlobal && globalCache[0]) {
        base44.entities.UserFixCache.create({
          user_id: user.id, issue_key: cacheKey, site_url: siteUrl,
          summary: cached.summary, steps: cached.steps,
          prompt: cached.prompt || null, explanation: cached.explanation || null,
          time_estimate: cached.time_estimate, fix_type: cached.type || 'solo',
          profile_type: techLevel,
        }).catch(() => {});
        base44.asServiceRole.entities.FixLibrary.update(globalCache[0].id, {
          use_count: (globalCache[0].use_count || 1) + 1,
        }).catch(() => {});
      }

      return Response.json({
        summary: cached.summary, steps,
        prompt: cached.prompt || null, explanation: cached.explanation || null,
        time_estimate: cached.time_estimate, type: cached.type || 'solo',
        profile_type: techLevel, from_cache: true,
      });
    }

    // ── Generate via LLM ──
    const isNoCode = techLevel === 'no_code';
    const isAiNoCode = techLevel === 'ai_nocode';
    const isDeveloper = techLevel === 'developer';
    const profileLabel = isNoCode ? 'NO-CODE' : isAiNoCode ? 'AI HELPER' : 'DEVELOPER';

    const platformHint = isNoCode
      ? "User is on Wix/WordPress/Squarespace. They CLICK, never code. Output must be paste-ready content."
      : isAiNoCode
      ? "User uses ChatGPT/Claude as assistant. They copy the prompt, paste response into their site."
      : "User is a developer. They want complete, validated, copy-pasteable code.";

    const needsPrompt = isNoCode || isAiNoCode;
    const requiredFields = needsPrompt
      ? ['summary', 'prompt', 'time_estimate']
      : ['summary', 'explanation', 'time_estimate'];

    // ── 10X better, 10X more concise prompt ──
    const prompt = `You are a world-class AEO (AI Engine Optimization) Consultant.

BUSINESS: ${businessName} | URL: ${siteUrl} | INDUSTRY: ${industry}
PROFILE: ${profileLabel} — ${platformHint}
PROBLEM: "${issueProblem}"

Generate a fix guide. Respond ONLY with JSON.

FIELDS:
1. "summary" — 1 punchy sentence + 1 quantified impact. Example: "AI can't find your contact info — losing 40% of 'near me' searches."
2. "time_estimate" — realistic: no_code "10-30 min" | ai_nocode "5-30 min" | developer "30 min-2h"
3. "type" — "solo" or "with help"
${needsPrompt ? `4. "prompt" — an expert prompt to copy into ChatGPT/Claude. Structure:
   - ROLE: hyper-specific expert (1 line)
   - CONTEXT: business="${businessName}", url=${siteUrl}, problem="${issueProblem}" (2 lines)
   - TASK: numbered deliverables (3-5 lines) with EXACT quantities ("3 sections", "4 steps")
   - CONSTRAINTS: bullet list with measurable rules (format, word count, tone, zero placeholders)
   - OUTPUT: exact format (HTML/plain text/JSON) + where to paste
   Rules: pre-fill ${businessName} and ${siteUrl} verbatim. Only [PHONE]/[ADDRESS]/[HOURS] allowed as placeholders. Zero commentary outside deliverables. End with a CTA. 15-30 lines total. Do NOT prefix with "Copy this into ChatGPT" — just the prompt itself.`
: `4. "explanation" — expert dev response with: ROOT CAUSE (spec ref), AI IMPACT (per LLM), STEP-BY-STEP, COMPLETE READY-TO-PASTE CODE (pre-filled with ${businessName}/${siteUrl}), VERIFICATION (test URL/curl), COMMON PITFALLS. 300-500 words, dense, zero fluff.`}
5. "steps" — array of 3-5 action strings. Each: "Action → Expected result". Concrete, no-code friendly.`;

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

    // ── Parallel save (fire-and-forget) ──
    const stepsJson = JSON.stringify(result.steps || []);
    Promise.all([
      base44.entities.UserFixCache.create({
        user_id: user.id, issue_key: cacheKey, site_url: siteUrl,
        summary: result.summary || '', steps: stepsJson,
        prompt: result.prompt || null, explanation: result.explanation || null,
        time_estimate: result.time_estimate || '', fix_type: result.type || 'solo',
        profile_type: techLevel,
      }).catch((e) => console.error('[cache_save_user]', e)),
      base44.asServiceRole.entities.FixLibrary.create({
        issue_key: cacheKey, issue_text: issueProblem, industry,
        summary: result.summary || '', steps: stepsJson,
        prompt: result.prompt || null, explanation: result.explanation || null,
        time_estimate: result.time_estimate || '', type: result.type || 'solo',
        use_count: 1,
      }).catch((e) => console.error('[cache_save_library]', e)),
    ]).catch(() => {});

    return Response.json({ ...result, profile_type: techLevel });
  } catch (error) {
    console.error('[generateFixInstruction]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});