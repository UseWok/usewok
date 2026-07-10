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

    // ── Gemini 3.1 Pro — scan ultra-réaliste avec internet search ──
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Tu es le meilleur expert mondial en visibilité IA (AEO) et SEO. Analyse CE site web avec une rigueur d'auditrice professionnelle : ${cleanUrl}

## INSTRUCTIONS CRITIQUES — RÉALISME ABSOLU

1. NAVIGUE RÉELLEMENT sur le site. Lis le contenu, les balises, la structure. Ne suppose RIEN à partir du nom de domaine.
2. business_type doit refléter l'ACTIVITÉ RÉELLE lue sur le site (ex: "plombier" pas "site web de plombier"). Si le site est un e-commerce de chaussures → "e-commerce de chaussures".
3. Les scores doivent être RÉALISTES et DIFFÉRENCIÉS :
   - Un site local inconnu sans schema, sans Google Business → overall_score 15-35, pas 60+
   - Un site bien optimisé avec schema, FAQ, Google Business → 55-80
   - Un site national reconnu → 70-95
   - Ne mets JAMAIS 80+ à un site que tu ne connais pas réellement
4. Pour gemini_score : demande-toi "Est-ce que Gemini connaîtrait ce site ?". Un site local inconnu = 5-20. Une marque nationale = 50-80.
5. issues : sois ULTRA-SPÉCIFIQUE. Pas "manque de contenu" mais "Aucune page 'À propos' détectée — les moteurs IA ne peuvent pas identifier qui gère cette entreprise". Cite la page exacte quand possible.
6. shock_insight : 1 phrase CHOC en français sur ce que l'entreprise perd concrètement (clients, ventes, visibilité). Sois direct, presque agressif. Ex: "ChatGPT recommande vos concurrents locaux parce qu'il ne sait pas que vous existez."

Retourne UNIQUEMENT un objet JSON valide.`,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          overall_score: { type: 'number' },
          ai_visibility_score: { type: 'number' },
          message_clarity_score: { type: 'number' },
          commercial_presence_score: { type: 'number' },
          business_name: { type: 'string' },
          business_type: { type: 'string' },
          city: { type: 'string' },
          country: { type: 'string' },
          gemini_score: { type: 'number' },
          gemini_sentiment: { type: 'string' },
          lrs_score: { type: 'number' },
          lrs_trend: { type: 'string' },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                problem: { type: 'string' },
                severity: { type: 'string' },
              }
            }
          },
          shock_insight: { type: 'string' },
          has_schema_markup: { type: 'boolean' },
          has_ssl: { type: 'boolean' },
          has_google_business: { type: 'boolean' },
        }
      }
    });

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