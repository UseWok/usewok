import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Static authority task definitions (NO AI — pre-written instructions) ──
const AUTHORITY_TASKS = [
  {
    platform_key: 'trustpilot',
    platform_label: 'Trustpilot',
    platform_url: 'trustpilot.com',
    signup_url: 'https://business.trustpilot.com/signup',
    action_title: 'Create your Trustpilot profile',
    points_base: 15,
    description: "Trustpilot is the most cited review platform by AI engines. An active profile with customer reviews massively boosts your authority and your chances of being recommended by ChatGPT and Gemini.",
    steps: [
      'Go to business.trustpilot.com and create a professional account with your business email address.',
      'Search for your company name to claim an existing page, or create a new listing.',
      'Fill in your business name, website, and main activity category.',
      'Add your logo and a clear description incorporating keywords from your industry.',
      'Invite your first customers to leave a review — each review strengthens the trust AI places in you.',
    ],
  },
  {
    platform_key: 'f6s',
    platform_label: 'F6S',
    platform_url: 'f6s.com',
    signup_url: 'https://www.f6s.com/',
    action_title: 'List your business on F6S',
    points_base: 10,
    description: "F6S is the world's leading business and startup directory. Being listed strengthens your digital footprint and helps AI identify you as a legitimate entity.",
    steps: [
      'Go to f6s.com and create a free account.',
      'Click "Add your company" to create your business listing.',
      'Fill in the name, website, a short description, and your activity category.',
      'Add your logo, co-founders, and your products or services.',
      'Publish the listing — F6S is indexed by AI engines as a reference directory.',
    ],
  },
  {
    platform_key: 'g2',
    platform_label: 'G2',
    platform_url: 'g2.com',
    signup_url: 'https://www.g2.com/claim_your_listing',
    action_title: 'Claim your G2 profile',
    points_base: 14,
    description: "G2 is the leading review platform for B2B software and services. An active profile massively increases your visibility in AI recommendations within your category.",
    steps: [
      'Go to g2.com/claim_your_listing to claim your business profile.',
      'Search for your company by name or website.',
      'Verify your affiliation with the company (business email required).',
      'Complete the profile: logo, description, category, and list of your products.',
      'Encourage your customers to post reviews — G2 is a premium source for AI recommendations.',
    ],
  },
];

// ── Diminishing returns: gain = base * (1 - current/100), capped at 99 ──
// At score 20 → gain is high; at score 70 → gain is low; never reaches 100.
function computeGain(base, currentScore) {
  const gain = base * (1 - currentScore / 100);
  return Math.min(gain, 99 - currentScore);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const action = body.action;
    const siteUrl = body.site_url || '';

    // Resolve user: from body.user_id (called from analyzeWebsite) or auth.me() (frontend)
    let userId = body.user_id;
    if (!userId) {
      const u = await base44.auth.me().catch(() => null);
      userId = u?.id;
    }
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ─────────────────────────────────────────────
    // SEED — create 3 authority tasks if they don't exist yet (idempotent, NO AI)
    // ─────────────────────────────────────────────
    if (action === 'seed') {
      if (!siteUrl) return Response.json({ error: 'site_url required' }, { status: 400 });
      const existing = await svc.entities.ActionTask.filter({ user_id: userId, site_url: siteUrl }).catch(() => []);
      const existingKeys = new Set(existing.map((t) => t.platform_key).filter(Boolean));
      const toCreate = AUTHORITY_TASKS.filter((t) => !existingKeys.has(t.platform_key));
      let created = 0;
      for (const t of toCreate) {
        await svc.entities.ActionTask.create({
          user_id: userId,
          site_url: siteUrl,
          platform_key: t.platform_key,
          platform: t.platform_label,
          action_title: t.action_title,
          action_index: AUTHORITY_TASKS.indexOf(t),
          engine: 'all',
          status: 'todo',
          points_base: t.points_base,
          points_granted: 0,
          instructions_json: JSON.stringify({
            steps: t.steps,
            description: t.description,
            signup_url: t.signup_url,
            platform_url: t.platform_url,
            platform_label: t.platform_label,
            favicon: `https://www.google.com/s2/favicons?domain=${t.platform_url}&sz=64`,
          }),
          verify_result_json: '',
          note: '{}',
        });
        created++;
      }
      return Response.json({ seeded: created, total: AUTHORITY_TASKS.length });
    }

    // ─────────────────────────────────────────────
    // VERIFY — Gemini 3 Flash checks if the brand is actually on the platform
    // ─────────────────────────────────────────────
    if (action === 'verify') {
      const taskId = body.task_id;
      if (!taskId) return Response.json({ error: 'task_id required' }, { status: 400 });

      const task = await svc.entities.ActionTask.get(taskId).catch(() => null);
      if (!task || task.user_id !== userId) return Response.json({ error: 'Task not found' }, { status: 404 });
      if (task.status === 'done') return Response.json({ error: 'Task already completed' }, { status: 409 });

      const taskSiteUrl = task.site_url || siteUrl;
      const taskDef = AUTHORITY_TASKS.find((t) => t.platform_key === task.platform_key);
      if (!taskDef) return Response.json({ error: 'Unknown platform' }, { status: 400 });

      // Get brand context
      let brandName = '', industry = '';
      let profile = null;
      try {
        const profiles = await svc.entities.BusinessProfile.filter({ created_by_id: userId });
        profile = profiles.find((p) => p.site_url === taskSiteUrl) || profiles[0];
        brandName = profile?.identity_name || '';
        industry = profile?.identity_industry || '';
      } catch {}

      const domain = (taskSiteUrl || '').replace(/https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      const brandLabel = brandName || domain;

      // Gemini 3 Flash with web context — real check if the brand has an active profile
      const result = await svc.integrations.Core.InvokeLLM({
        prompt: `You are checking whether the company "${brandLabel}" (${domain})${industry ? `, industry: ${industry}` : ''} has an active profile on ${taskDef.platform_label} (${taskDef.platform_url}).

Using internet context, search whether THIS specific company has a real page/profile on ${taskDef.platform_label}.

STRICT validation criteria:
- It must be THIS specific company (not a namesake)
- The profile must exist and be active (not just an auto-generated empty page)
- The website mentioned on the profile must match ${domain}

Strict JSON:
{
  "verified": true/false,
  "confidence": 0-100,
  "profile_url": "URL of the profile found on ${taskDef.platform_url}, or empty string",
  "what_was_found": "What you actually found (be specific: company name on the profile, number of reviews if visible, etc.)",
  "feedback": "Direct and friendly message to the user. If verified: congratulations + concrete business impact on AI visibility. If not verified: specific encouragement on what remains to be done."
}`,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: 'object',
          properties: {
            verified: { type: 'boolean' },
            confidence: { type: 'number' },
            profile_url: { type: 'string' },
            what_was_found: { type: 'string' },
            feedback: { type: 'string' },
          },
          required: ['verified', 'confidence', 'feedback'],
        },
      });

      // If verified → apply diminishing-returns score boost to score_ai_visibility
      if (result?.verified) {
        const currentScore = profile?.score_ai_visibility || 0;
        const gain = computeGain(task.points_base || taskDef.points_base, currentScore);
        const newScore = Math.min(99, Math.round((currentScore + gain) * 10) / 10);
        const granted = Math.round(gain * 10) / 10;

        if (profile) {
          await svc.entities.BusinessProfile.update(profile.id, { score_ai_visibility: newScore });
        }
        await svc.entities.ActionTask.update(taskId, {
          status: 'done',
          points_granted: granted,
          verify_result_json: JSON.stringify(result),
          note: JSON.stringify({ verified: true, profile_url: result.profile_url || '', new_score: newScore, granted }),
        });

        return Response.json({
          ...result,
          points_granted: granted,
          new_score: newScore,
        });
      }

      // Not verified → keep task open, store result
      await svc.entities.ActionTask.update(taskId, {
        verify_result_json: JSON.stringify(result),
        note: JSON.stringify({ verified: false }),
      });
      return Response.json(result);
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[authorityTasks]', error);
    return Response.json({ error: error?.message || 'Failed' }, { status: 500 });
  }
});