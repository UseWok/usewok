import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { conversationId } = await req.json();
    
    if (!conversationId) {
      return Response.json({ error: 'conversationId required' }, { status: 400 });
    }

    // Fetch the conversation
    const results = await base44.asServiceRole.entities.Conversation.filter({ conv_id: conversationId });
    if (!results.length) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conv = results[0];
    const { title, description } = conv;
    const prompt = title || description || 'Create a professional landing page';

    // Generate code using LLM
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert UI/React developer. Generate a complete, professional React component based on this request. Return ONLY valid JSX code wrapped in \`\`\`jsx fence.\n\nRequest: "${prompt}"`,
      model: 'gpt_5_mini',
    });

    const code = typeof response === 'string' ? response : JSON.stringify(response);
    
    // Ensure code is wrapped in fence if not already
    let wrappedCode = code;
    if (!code.includes('```')) {
      wrappedCode = `\`\`\`jsx\n${code}\n\`\`\``;
    }

    // Update conversation with generated content
    await base44.asServiceRole.entities.Conversation.update(conv.id, {
      raw_content: wrappedCode,
      messages_json: JSON.stringify([
        {
          role: 'user',
          content: prompt
        },
        {
          role: 'assistant',
          content: 'Auto-generated content for public display.',
          rawContent: wrappedCode
        }
      ]),
    });

    return Response.json({
      success: true,
      conversationId,
      message: 'App regenerated successfully',
      preview: wrappedCode.slice(0, 200) + '...'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});