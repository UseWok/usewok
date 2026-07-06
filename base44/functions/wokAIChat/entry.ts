import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { system_prompt, history, prompt, file_urls } = body;
    if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

    let apiKey = Deno.env.get('gemini-1.5-flash') || '';
    apiKey = apiKey.trim().replace(/^export\s+/i, '');
    if (apiKey.includes('=')) apiKey = apiKey.split('=').slice(1).join('=').trim();
    apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
    if (!apiKey) return Response.json({ error: 'API key not configured' }, { status: 500 });

    // Build Gemini-compatible contents array (roles: user/model)
    const contents = [];
    if (Array.isArray(history)) {
      for (const h of history) {
        if (!h.content) continue;
        contents.push({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] });
      }
    }

    // User message — include file URLs as text references if provided
    let userContent = prompt;
    if (Array.isArray(file_urls) && file_urls.length > 0) {
      userContent += '\n\n[Attached files]: ' + file_urls.join(', ');
    }
    contents.push({ role: 'user', parts: [{ text: userContent }] });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: system_prompt ? { parts: [{ text: system_prompt }] } : undefined,
        contents,
        generationConfig: { maxOutputTokens: 2000 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[wokAIChat] Gemini error:', response.status, errText);
      return Response.json({ error: `API error: ${response.status}`, details: errText.slice(0, 500) }, { status: 502 });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';

    return Response.json({ response: content });
  } catch (error) {
    console.error('[wokAIChat] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});