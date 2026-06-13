import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // ── Mode 1: Screenshot capture when a build is published ──
    if (body.capture_screenshot && body.conv_id && body.public_url) {
      const { conv_id, public_url } = body;

      // Find the conversation record
      const results = await base44.asServiceRole.entities.Conversation.filter({ conv_id });
      if (!results.length) {
        return Response.json({ error: 'Conversation not found' }, { status: 404 });
      }
      const conv = results[0];

      // Use AI to generate a high-quality thumbnail image based on the app title + content
      // (Real headless browser screenshot APIs require external keys — we generate a visual placeholder instead)
      const titleForThumb = conv.title || 'Web App';
      const codeSnippet = (conv.raw_content || '').slice(0, 1500);

      // Step 1: describe the UI visually
      const description = await base44.integrations.Core.InvokeLLM({
        model: 'gpt_5_mini',
        prompt: `You are a UI screenshot describer. Given this React component code, write a vivid 1-sentence description of what the rendered UI looks like visually (colors, layout, key elements). Keep it under 80 words, suitable as an image generation prompt.\n\nApp title: "${titleForThumb}"\n\nCode:\n${codeSnippet}`,
      });

      if (!description || typeof description !== 'string') {
        return Response.json({ success: false, reason: 'description failed' });
      }

      // Step 2: generate thumbnail
      const { url: thumbnailUrl } = await base44.integrations.Core.GenerateImage({
        prompt: `Clean UI screenshot mockup of a web app: ${description.trim()}. Modern, professional, browser window frame, high-res, light background.`,
      });

      if (!thumbnailUrl) {
        return Response.json({ success: false, reason: 'image generation failed' });
      }

      // Step 3: persist thumbnail_url permanently
      await base44.asServiceRole.entities.Conversation.update(conv.id, {
        thumbnail_url: thumbnailUrl,
      });

      return Response.json({ success: true, thumbnail_url: thumbnailUrl, conv_id });
    }

    // ── Mode 2: Legacy — regenerate app content ──
    const conversationId = body.conversationId || body.conv_id;
    if (!conversationId) {
      return Response.json({ error: 'conversationId or conv_id required' }, { status: 400 });
    }

    const results = await base44.asServiceRole.entities.Conversation.filter({ conv_id: conversationId });
    if (!results.length) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conv = results[0];
    const prompt = conv.title || conv.description || 'Create a professional landing page';

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert UI/React developer. Generate a complete, professional React component based on this request. Return ONLY valid JSX code wrapped in \`\`\`jsx fence.\n\nRequest: "${prompt}"`,
      model: 'gpt_5_mini',
    });

    const code = typeof response === 'string' ? response : JSON.stringify(response);
    let wrappedCode = code;
    if (!code.includes('```')) {
      wrappedCode = `\`\`\`jsx\n${code}\n\`\`\``;
    }

    await base44.asServiceRole.entities.Conversation.update(conv.id, {
      raw_content: wrappedCode,
      messages_json: JSON.stringify([
        { role: 'user', content: prompt },
        { role: 'assistant', content: 'Auto-generated content for public display.', rawContent: wrappedCode },
      ]),
    });

    return Response.json({ success: true, conversationId, message: 'App regenerated successfully' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});