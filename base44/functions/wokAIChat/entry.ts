import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { system_prompt, history, prompt, file_urls, model } = body;
    if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

    // Build conversation into a single prompt (InvokeLLM takes one prompt string)
    let fullPrompt = system_prompt ? system_prompt + '\n\n' : '';
    if (Array.isArray(history)) {
      for (const h of history) {
        if (!h.content) continue;
        fullPrompt += `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}\n\n`;
      }
    }
    fullPrompt += `User: ${prompt}\n\nAssistant:`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      ...(model ? { model } : {}),
      ...(Array.isArray(file_urls) && file_urls.length > 0 ? { file_urls } : {}),
    });

    const content = typeof result === 'string' ? result : (result?.response || result?.data || String(result || ''));

    return Response.json({ response: content });
  } catch (error) {
    console.error('[wokAIChat] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});