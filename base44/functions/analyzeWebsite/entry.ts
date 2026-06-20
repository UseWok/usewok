import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'URL required' }, { status: 400 });
    }

    // Normalize URL
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    // Fire all 3 AI queries IN PARALLEL — no cascade
    const [seoResult, chatgptResult, perplexityResult] = await Promise.all([
      // 1. Fetch & analyze the actual website content
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are an AI visibility expert. Fetch and analyze this website: ${cleanUrl}
        
        Return a JSON with:
        - ai_visibility_score: number 0-100 (how well AI models can understand and recommend this business)
        - message_clarity_score: number 0-100 (how clear the value proposition is)
        - commercial_presence_score: number 0-100 (how complete the commercial info is: prices, services, location)
        - overall_score: number 0-100 (weighted average)
        - business_name: string (detected business name)
        - business_type: string (type of business)
        - city: string (detected city if any, else "unknown")
        - issues: array of 3 objects with { problem: string (specific, based on real content), category: string }
        - strengths: array of 2 strings (what the site does well)
        - shock_insight: string (one powerful sentence about what they're losing, specific to their business)
        
        Be brutally honest. Most SMB websites score between 10-40. Base scores on real analysis of the actual content.`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
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
            issues: { type: 'array', items: { type: 'object', properties: { problem: { type: 'string' }, category: { type: 'string' } } } },
            strengths: { type: 'array', items: { type: 'string' } },
            shock_insight: { type: 'string' },
          }
        }
      }),

      // 2. Check ChatGPT visibility — would it recommend this business?
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Imagine you are ChatGPT answering a user question. Would you recommend the business at ${cleanUrl} if a user searched for their type of service in their city?

        Search the web to find out what this business does, then answer:
        - chatgpt_mentions: boolean (true if a well-optimized business like this would typically appear in ChatGPT answers)
        - chatgpt_score: number 0-100 (likelihood of being recommended by ChatGPT)
        - chatgpt_reason: string (one sentence why or why not, specific to this business)`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            chatgpt_mentions: { type: 'boolean' },
            chatgpt_score: { type: 'number' },
            chatgpt_reason: { type: 'string' },
          }
        }
      }),

      // 3. Check Perplexity / Google AI visibility
      base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Check the AI and search engine visibility of the business at ${cleanUrl}.
        
        Search the web to find this business, then return:
        - perplexity_score: number 0-100 (likelihood of appearing in Perplexity AI answers)
        - google_ai_score: number 0-100 (likelihood of appearing in Google AI Overviews)
        - has_schema_markup: boolean (does site have structured data/schema.org)
        - has_google_business: boolean (does business appear to have Google Business Profile)
        - perplexity_reason: string (one sentence, specific to this business)`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            perplexity_score: { type: 'number' },
            google_ai_score: { type: 'number' },
            has_schema_markup: { type: 'boolean' },
            has_google_business: { type: 'boolean' },
            perplexity_reason: { type: 'string' },
          }
        }
      }),
    ]);

    // Merge results
    const result = {
      ...seoResult,
      ...chatgptResult,
      ...perplexityResult,
      url: cleanUrl,
      analyzed_at: new Date().toISOString(),
    };

    // Save lead in background (don't await)
    base44.asServiceRole.entities.ContactLead.create({
      website: cleanUrl,
      first_name: result.business_name || '',
      role: result.business_type || '',
      message: `AI scan: score ${result.overall_score}/100`,
      status: 'new',
    }).catch(() => {});

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});