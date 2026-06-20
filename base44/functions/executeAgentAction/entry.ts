import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ACTION_COSTS = {
  SCAN: 30,
  FIX: 8,
  SCRIPT: 10,
  EDIT: 5,
};

const AGENT_PROMPTS = {
  SEO: (profile, section) => `
You are an expert SEO and AI visibility optimizer. 
Business: ${profile.identity_name || 'Unknown'}, Industry: ${profile.identity_industry || 'Unknown'}, City: ${profile.identity_city || 'Unknown'}.
Site URL: ${profile.site_url}.
Target section to fix: "${section}".

Generate a specific, actionable optimization for this business to improve its AI visibility (ChatGPT, Perplexity, Gemini).
Focus on: Schema markup improvements, entity clarity, FAQ content, E-E-A-T signals.
Return a JSON object with:
{
  "fix_summary": "1-sentence summary of what was fixed",
  "schema_markup": "JSON-LD schema to add (if applicable)",
  "content_additions": ["bullet list of content to add"],
  "score_improvement": number between 3 and 18
}`,

  COPYWRITER: (profile, section) => `
You are a conversion copywriter specialized in AI-indexable content.
Business: ${profile.identity_name || 'Unknown'}, Tone: ${profile.brand_tone || 'professional'}.
Site URL: ${profile.site_url}.
Target section to rewrite: "${section}".

Rewrite/enhance this section so it is highly citable by AI engines.
Use clear entity language, answer likely user questions directly, and include natural semantic keywords.
Return a JSON object with:
{
  "fix_summary": "1-sentence summary",
  "rewritten_content": "the improved text block",
  "keywords_added": ["list of keywords"],
  "score_improvement": number between 3 and 12
}`,

  CONVERSION: (profile, section) => `
You are a conversion rate and commercial presence specialist.
Business: ${profile.identity_name || 'Unknown'}, Industry: ${profile.identity_industry || 'Unknown'}.
Products: ${profile.products || 'N/A'}.
Target section: "${section}".

Improve the commercial signals on this section for better AI commercial intent recognition.
Add clear pricing signals, trust indicators, and CTA clarity.
Return a JSON object with:
{
  "fix_summary": "1-sentence summary",
  "commercial_additions": ["list of elements to add"],
  "trust_signals": ["trust indicators to implement"],
  "score_improvement": number between 2 and 10
}`,
};

function selectAgent(actionType, targetSection) {
  const sectionLower = (targetSection || '').toLowerCase();
  if (actionType === 'FIX' || sectionLower.includes('schema') || sectionLower.includes('seo') || sectionLower.includes('faq')) {
    return 'SEO';
  }
  if (actionType === 'SCRIPT' || sectionLower.includes('copy') || sectionLower.includes('content') || sectionLower.includes('message')) {
    return 'COPYWRITER';
  }
  return 'CONVERSION';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { actionType, userId, targetSection } = await req.json();

    if (!actionType || !ACTION_COSTS[actionType]) {
      return Response.json({ error: 'Invalid actionType. Must be SCAN, FIX, SCRIPT, or EDIT.' }, { status: 400 });
    }

    const cost = ACTION_COSTS[actionType];

    // 1. Calculate credit balance from CreditLedger
    const ledgerEntries = await base44.asServiceRole.entities.CreditLedger.filter({ user_id: user.id });
    const balance = ledgerEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);

    // Also check platform credits
    const platformCredits = (user.credits_limit || 100) - (user.credits_used || 0);
    const effectiveBalance = balance + platformCredits;

    if (effectiveBalance < cost) {
      return Response.json({
        error: 'Insufficient credits',
        required: cost,
        available: effectiveBalance,
      }, { status: 402 });
    }

    // 2. Debit credits in ledger
    await base44.asServiceRole.entities.CreditLedger.create({
      user_id: user.id,
      action: actionType,
      amount: -cost,
      description: `Agent action: ${actionType} on "${targetSection}"`,
      timestamp: new Date().toISOString(),
    });

    // 3. Fetch BusinessProfile for this user
    const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: user.id });
    const profile = profiles[0] || {};

    // 4. Select agent and build prompt
    const agentType = selectAgent(actionType, targetSection);
    const promptFn = AGENT_PROMPTS[agentType];
    const prompt = promptFn(profile, targetSection);

    // 5. Call InvokeLLM
    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          fix_summary: { type: 'string' },
          score_improvement: { type: 'number' },
        },
      },
    });

    const scoreImprovement = llmResult?.score_improvement || 5;

    // 6. Update BusinessProfile scores
    if (profiles.length > 0) {
      const currentOverall = profile.score_overall || 0;
      const newOverall = Math.min(100, currentOverall + scoreImprovement);

      await base44.entities.BusinessProfile.update(profiles[0].id, {
        score_previous: currentOverall,
        score_overall: newOverall,
        last_scan: new Date().toISOString(),
      });

      return Response.json({
        success: true,
        agentType,
        result: llmResult,
        scores: {
          previous: currentOverall,
          new: newOverall,
          improvement: scoreImprovement,
        },
        creditsUsed: cost,
        balanceAfter: effectiveBalance - cost,
      });
    }

    return Response.json({
      success: true,
      agentType,
      result: llmResult,
      scores: {
        previous: 0,
        new: scoreImprovement,
        improvement: scoreImprovement,
      },
      creditsUsed: cost,
      balanceAfter: effectiveBalance - cost,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});