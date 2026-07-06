import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { system_prompt, history, prompt, file_urls } = body;
    if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

    let apiKey = Deno.env.get('OpenAI_ChatBot') || '';
    // Clean key — handle cases where secret was stored as "export VAR=key" or with quotes/whitespace
    apiKey = apiKey.trim().replace(/^export\s+/i, '');
    if (apiKey.includes('=')) apiKey = apiKey.split('=').slice(1).join('=').trim();
    apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
    if (!apiKey) return Response.json({ error: 'API key not configured' }, { status: 500 });

    // Build OpenAI-compatible messages array
    const messages = [];
    if (system_prompt) messages.push({ role: 'system', content: system_prompt });
    if (Array.isArray(history)) {
      for (const h of history) {
        if (!h.content) continue;
        messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
      }
    }

    // User message — include file URLs as text references if provided
    let userContent = prompt;
    if (Array.isArray(file_urls) && file_urls.length > 0) {
      userContent += '\n\n[Attached files]: ' + file_urls.join(', ');
    }
    messages.push({ role: 'user', content: userContent });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[wokAIChat] OpenAI error:', response.status, errText);
      return Response.json({ error: `API error: ${response.status}`, details: errText.slice(0, 500) }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return Response.json({ response: content });
  } catch (error) {
    console.error('[wokAIChat] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});