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

    // ── Server-side quota enforcement (anti-abuse) ────────────────────────────
    const authUser = await base44.auth.me().catch(() => null);
    if (!authUser) return Response.json({ error: 'Authentication required' }, { status: 401 });
    const guardRes = await base44.functions.invoke('quotaGuard', { action: 'scan', site_url: cleanUrl }).catch(() => null);
    if (!guardRes?.data?.allowed) {
      console.log(`[analyzeWebsiteLite] Quota blocked for ${authUser.email}: ${guardRes?.data?.reason || 'unknown'}`);
      return Response.json({ error: 'Quota exceeded', reason: guardRes?.data?.reason || 'scan_limit', quota: guardRes?.data || null }, { status: 429 });
    }

    // Un seul appel LLM avec internet search — gemini_3_flash ne supporte pas
    // response_json_schema + add_context_from_internet, donc on parse la réponse string
    const raw = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Expert visibilité IA. Analyse ${cleanUrl}. Retourne UNIQUEMENT un JSON valide:
{"overall_score":0-100,"ai_visibility_score":0-100,"message_clarity_score":0-100,"commercial_presence_score":0-100,"business_name":"","business_type":"(activité réelle, pas le domaine)","city":"","country":"ISO2","gemini_score":0-100,"gemini_sentiment":"positive|neutral|negative","lrs_score":0-100,"lrs_trend":"rising|stable|declining","issues":[{"problem":"français simple non-tech","severity":"error|warning"}],"shock_insight":"1 phrase percutante sur ce qu'ils perdent","has_schema_markup":false,"has_ssl":false,"has_google_business":false}
RÈGLES: max 3 issues en français simple. Ne déduis pas business_type du domaine. JSON seul.`,
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

        // Record consumption + history snapshot (server-side, non-forgeable)
        await base44.asServiceRole.entities.CreditLedger.create({
          user_id: user.id, action: 'SCAN', amount: -1,
          description: `Lite scan ${cleanUrl}`, timestamp: new Date().toISOString(),
        }).catch(() => {});
        await base44.asServiceRole.entities.ScanRecord.create({
          user_id: user.id, site_url: cleanUrl,
          score_overall: result.overall_score || 0,
          score_ai_visibility: result.ai_visibility_score || 0,
          score_message_clarity: result.message_clarity_score || 0,
          score_commercial_signal: result.commercial_presence_score || 0,
          lrs_score: result.lrs_score || 0,
          scan_type: 'lite',
        }).catch(() => {});
      }
    } catch {}

    return Response.json(finalResult);
  } catch (error) {
    console.error('analyzeWebsiteLite error:', error);
    return Response.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
});