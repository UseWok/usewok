/**
 * analyzeWebsiteLite — Scan économique (1 appel LLM au lieu de 4)
 * Retourne : score global, 3 problèmes, shock_insight, scores Gemini uniquement
 * Coût estimé : ~2x moins cher que analyzeWebsite
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return Response.json({ error: 'URL required' }, { status: 400 });
    }

    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;

    // Un seul appel LLM avec internet search — gemini_3_flash ne supporte pas
    // response_json_schema + add_context_from_internet, donc on parse la réponse string
    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es un expert en visibilité IA. Analyse ce site web : ${cleanUrl}

Lis le contenu réel du site, puis retourne UNIQUEMENT un objet JSON valide (sans markdown, sans backticks) avec ces champs :

{
  "overall_score": number 0-100,
  "ai_visibility_score": number 0-100,
  "message_clarity_score": number 0-100,
  "commercial_presence_score": number 0-100,
  "business_name": "string",
  "business_type": "string (activité réelle, pas le nom de domaine)",
  "city": "string",
  "country": "code ISO 2 lettres",
  "gemini_score": number 0-100,
  "gemini_sentiment": "positive|neutral|negative",
  "lrs_score": number 0-100,
  "lrs_trend": "rising|stable|declining",
  "issues": [{"problem": "en français simple non-technique", "severity": "error|warning"}],
  "shock_insight": "une phrase percutante en français sur ce que l'entreprise perd",
  "has_schema_markup": boolean,
  "has_ssl": boolean,
  "has_google_business": boolean
}

RÈGLES :
- issues : max 3, en français pour un non-technicien (pas de jargon technique)
- Ne déduis pas business_type du nom de domaine, lis le contenu
- Retourne UNIQUEMENT le JSON, rien d'autre`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
    });

    // Parse la réponse string en JSON
    let result = {};
    try {
      const str = typeof raw === 'string' ? raw : JSON.stringify(raw);
      const match = str.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else result = typeof raw === 'object' ? raw : {};
    } catch {
      result = typeof raw === 'object' ? raw : {};
    }

    const finalResult = {
      ...result,
      url: cleanUrl,
      analyzed_at: new Date().toISOString(),
      scan_type: 'lite',
    };

    // Lead non-bloquant
    base44.asServiceRole.entities.ContactLead.create({
      website: cleanUrl,
      first_name: result.business_name || '',
      role: result.business_type || '',
      message: `Lite scan: LRS ${result.lrs_score}/100 | score ${result.overall_score}/100`,
      status: 'new',
    }).catch(() => {});

    // Save to BusinessProfile
    try {
      const user = await base44.auth.me().catch(() => null);
      if (user) {
        const profiles = await base44.asServiceRole.entities.BusinessProfile.filter({ created_by_id: user.id });
        const existing = profiles.find(p => p.site_url === cleanUrl);
        let brand_keywords = JSON.stringify(finalResult);
        try {
          const fileObj = new File([brand_keywords], "data.json", { type: "application/json" });
          const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: fileObj });
          if (uploadRes?.file_url) brand_keywords = uploadRes.file_url;
        } catch {}

        const profileFields = {
          site_url: cleanUrl,
          identity_name: result.business_name || '',
          identity_industry: result.business_type || '',
          identity_city: result.city || '',
          score_ai_visibility: result.ai_visibility_score || 0,
          score_message_clarity: result.message_clarity_score || 0,
          score_commercial_signal: result.commercial_presence_score || 0,
          score_overall: result.overall_score || 0,
          last_scan: new Date().toISOString(),
          brand_keywords,
        };
        if (existing) {
          await base44.asServiceRole.entities.BusinessProfile.update(existing.id, profileFields);
        } else {
          await base44.asServiceRole.entities.BusinessProfile.create({ ...profileFields, created_by_id: user.id });
        }
      }
    } catch {}

    return Response.json(finalResult);
  } catch (error) {
    console.error('analyzeWebsiteLite error:', error);
    return Response.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
});