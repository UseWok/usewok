import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const POOLSIDE_API_URL = 'https://inference.poolside.ai/v1/chat/completions';
const POOLSIDE_MODEL = 'poolside/laguna-xs.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { system_prompt, history, prompt, file_urls } = body;
    if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

    // Build OpenAI-compatible messages array
    const messages = [];
    if (system_prompt) messages.push({ role: 'system', content: system_prompt });
    if (Array.isArray(history)) {
      for (const h of history) {
        if (!h.content) continue;
        messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
      }
    }
    // Attach file_urls to the user message if provided (OpenAI vision format)
    if (Array.isArray(file_urls) && file_urls.length > 0) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...file_urls.map(u => ({ type: 'image_url', image_url: { url: u } })),
        ],
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    const apiKey = Deno.env.get('Poolside:_Laguna_XS_2.1');
    if (!apiKey) return Response.json({ error: 'Poolside API key not configured' }, { status: 500 });

    const apiRes = await fetch(POOLSIDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: POOLSIDE_MODEL,
        messages,
        max_tokens: 2048,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text().catch(() => '');
      console.error('[wokAIChat] Poolside error:', apiRes.status, errText);
      return Response.json({ error: `Poolside API error (${apiRes.status}): ${errText.slice(0, 300)}` }, { status: 502 });
    }

    const data = await apiRes.json();
    const content = data?.choices?.[0]?.message?.content || '';

    return Response.json({ response: content });
  } catch (error) {
    console.error('[wokAIChat] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});