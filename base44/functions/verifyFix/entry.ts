import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { issue, taskTitle, fixData, businessProfile } = body;

    const siteUrl = businessProfile?.site_url || '';
    const businessName = businessProfile?.identity_name || '';
    const industry = businessProfile?.identity_industry || '';
    const city = businessProfile?.identity_city || '';
    const target = businessProfile?.identity_target || '';
    const brandKeywords = businessProfile?.brand_keywords || '';
    const products = businessProfile?.products || '';

    const fixSummary = fixData?.summary || '';
    const fixSteps = fixData?.steps || [];
    const fixPrompt = fixData?.prompt || '';
    const fixExplanation = fixData?.explanation || '';

    const taskLabel = taskTitle || issue || '';

    const prompt = `You are an AEO (AI Engine Optimization) expert who verifies whether a fix has been successfully applied to a live website.

COMPLETE BUSINESS IDENTITY:
- Name: "${businessName}"
- Website: ${siteUrl}
- Industry: ${industry}
- City: ${city}
- Target audience: ${target}
- Brand keywords: ${brandKeywords}
- Products/services: ${products}

TASK TO VERIFY:
${taskLabel}

${issue && issue !== taskLabel ? `Initial issue identified: ${issue}` : ''}

WHAT SHOULD HAVE BEEN DONE:
${fixSummary}

${fixSteps && fixSteps.length > 0 ? `Expected steps:\n${fixSteps.map((s, i) => `${i+1}. ${typeof s === 'string' ? s : s.description || s.text || ''}`).join('\n')}` : ''}

${fixPrompt ? `Prompt used to generate content:\n${fixPrompt}` : ''}

${fixExplanation ? `Technical explanation:\n${fixExplanation}` : ''}

MISSION:
1. Go to the site ${siteUrl} and analyze its current content (pages, text, HTML structure, structured data)
2. Check if the fix described above has been applied to the site
3. Look specifically for the elements the fix should have produced:
   - Generated text (paragraphs, descriptions, headings)
   - HTML structure (semantic tags, sections)
   - Structured data (JSON-LD, schema.org)
   - Meta tags
   - Page content matching the business "${businessName}"
4. Be RIGOROUS: only validate if you actually find the fix on the live site

MANDATORY JSON RESPONSE:
{
  "verified": true/false,
  "confidence": 0-100,
  "what_was_found": "What you actually found on the site (be specific: which page, what content, what tag)",
  "what_is_missing": "What is still missing (leave empty if everything is validated)",
  "feedback": "Direct and friendly message to the user. If validated: congratulations + business impact. If not validated: precise encouragement on what remains to be done."
}`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash',
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          verified: { type: 'boolean' },
          confidence: { type: 'number' },
          what_was_found: { type: 'string' },
          what_is_missing: { type: 'string' },
          feedback: { type: 'string' },
        },
        required: ['verified', 'confidence', 'what_was_found', 'feedback'],
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('[verifyFix]', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});