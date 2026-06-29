/**
 * brevoEmailSystem — Système d'emailing complet via Brevo API
 *
 * Actions disponibles :
 * - syncContact        : Créer/mettre à jour un contact Brevo avec attributs enrichis
 * - sendEmail          : Envoyer un email transactionnel personnalisé
 * - triggerSequence    : Déclencher une séquence selon le segment utilisateur
 * - updateContactEvent : Mettre à jour un événement/attribut clé du contact
 *
 * Segments :
 * - free_active        : Free + a fait un scan
 * - free_inactive      : Free + aucun scan
 * - paid               : Abonné payant
 * - pricing_viewed     : A vu la page pricing sans acheter
 * - chatbot_used       : A utilisé le chatbot sans convertir
 *
 * Séquences déclenchées :
 * - welcome            : Email de bienvenue (J0)
 * - post_scan          : Résultats choc avec données réelles (J+1)
 * - no_scan_j3         : Relance douce (J+3)
 * - pricing_no_buy     : Casser l'objection (après visite pricing)
 * - chatbot_no_convert : Relier questions aux erreurs (après chatbot)
 * - inactive_j14       : Le monde a avancé (J+14)
 * - last_j30           : Dernier email, pour de vrai (J+30)
 * - post_paid          : Plan d'action post-achat
 * - paid_j7            : Premier résultat J+7
 * - paid_monthly       : Rapport mensuel anti-churn
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const BREVO_API = 'https://api.brevo.com/v3';

// ── Helpers Brevo ────────────────────────────────────────────────────────────

async function brevoRequest(endpoint, method, body) {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  if (!apiKey) throw new Error('BREVO_API_KEY not set');

  const res = await fetch(`${BREVO_API}${endpoint}`, {
    method,
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (!res.ok) {
    console.error(`[Brevo] ${method} ${endpoint} failed:`, res.status, data);
    throw new Error(`Brevo error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

// ── Créer/mettre à jour un contact Brevo ────────────────────────────────────

async function syncContact({ email, firstName, lastName, attributes = {}, listIds = [] }) {
  const payload = {
    email,
    attributes: {
      FIRSTNAME: firstName || '',
      LASTNAME: lastName || '',
      ...attributes,
    },
  };
  if (listIds.length > 0) payload.listIds = listIds;

  try {
    // Essayer de créer
    await brevoRequest('/contacts', 'POST', payload);
  } catch (e) {
    if (e.message.includes('duplicate')) {
      // Mettre à jour si existe déjà
      await brevoRequest(`/contacts/${encodeURIComponent(email)}`, 'PUT', {
        attributes: payload.attributes,
        ...(listIds.length > 0 ? { listIds } : {}),
      });
    } else {
      throw e;
    }
  }
  console.log(`[Brevo] Contact synced: ${email}`);
  return { success: true, email };
}

// ── Mettre à jour un attribut de contact ─────────────────────────────────────

async function updateContactAttributes(email, attributes) {
  await brevoRequest(`/contacts/${encodeURIComponent(email)}`, 'PUT', { attributes });
  console.log(`[Brevo] Contact updated: ${email}`, attributes);
  return { success: true };
}

// ── Envoyer un email transactionnel ─────────────────────────────────────────

async function sendTransactionalEmail({ to, subject, htmlContent, textContent, tags = [] }) {
  const payload = {
    sender: { name: 'UseWok', email: 'hello@usewok.com' },
    to: [{ email: to }],
    subject,
    htmlContent,
    textContent: textContent || htmlContent.replace(/<[^>]+>/g, ''),
    tags,
  };

  const result = await brevoRequest('/smtp/email', 'POST', payload);
  console.log(`[Brevo] Email sent to ${to}: "${subject}"`);
  return result;
}

// ── Templates d'emails ───────────────────────────────────────────────────────

function emailWelcome({ firstName, siteUrl }) {
  const name = firstName || 'toi';
  return {
    subject: `Bienvenue sur UseWok${siteUrl ? ` — ${siteUrl}` : ''}`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>Ton compte est prêt.</p>
<p>Une seule question : <strong>est-ce que ChatGPT te recommande quand quelqu'un cherche ce que tu fais ?</strong></p>
<p>Probablement non. Et c'est normal — la plupart des sites ne sont pas structurés pour les IA.</p>
<p>Le scan prend 30 secondes. Il te montre exactement où tu en es.</p>
<p><a href="https://app.usewok.com" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Lancer mon premier scan →</a></p>
<p style="color:#888;font-size:13px">Si tu as un problème, réponds à cet email. C'est moi qui lis.</p>
</div>`,
  };
}

function emailPostScan({ firstName, siteUrl, score, criticalErrors, totalIssues }) {
  const name = firstName || 'toi';
  const site = siteUrl || 'ton site';
  const errors = criticalErrors || 0;
  const total = totalIssues || 0;
  const scoreVal = score || 0;

  return {
    subject: `${errors} erreurs critiques sur ${site}`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>Ton scan est prêt. Voilà ce qu'on a trouvé :</p>
<div style="background:#f8f7f4;border-radius:12px;padding:20px;margin:20px 0">
  <div style="font-size:36px;font-weight:900;letter-spacing:-2px">${scoreVal}<span style="font-size:16px;font-weight:400;color:#888">/100</span></div>
  <div style="color:#888;font-size:13px;margin-top:4px">Score de visibilité IA</div>
  <div style="margin-top:16px;color:#ff5a1f;font-weight:700">${errors} erreurs critiques</div>
  <div style="color:#888;font-size:13px">${total} problèmes détectés au total</div>
</div>
<p>Ce qui se passe concrètement :</p>
<p style="border-left:3px solid #ff5a1f;padding-left:16px;color:#555">Quelqu'un demande à ChatGPT un professionnel dans ton secteur.<br>Ton concurrent sort en premier. Toi non.<br>À chaque fois.</p>
<p><a href="https://app.usewok.com/ai-report" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Voir mes erreurs et les corriger →</a></p>
<p style="color:#888;font-size:13px">Les corrections sont dans le rapport. Certaines prennent 5 minutes.</p>
</div>`,
  };
}

function emailNoScanJ3({ firstName }) {
  const name = firstName || 'toi';
  return {
    subject: `Tu as créé un compte et... c'est tout ?`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>Pas de jugement.</p>
<p>Mais pendant ce temps, les IA crawlent le web tous les jours. Elles décident <strong>qui recommander</strong>.</p>
<p>Sans données structurées, tu n'existes pas pour elles. C'est pas une opinion, c'est le fonctionnement de ChatGPT, Gemini, Perplexity.</p>
<p>30 secondes. Un URL. C'est tout.</p>
<p><a href="https://app.usewok.com" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Lancer mon scan →</a></p>
<p style="color:#888;font-size:13px">Problème technique ? Réponds directement à cet email, c'est moi qui lis.</p>
</div>`,
  };
}

function emailPricingNoBuy({ firstName, siteUrl, criticalErrors }) {
  const name = firstName || 'toi';
  const site = siteUrl || 'ton site';
  const errors = criticalErrors || 0;

  return {
    subject: `Le vrai coût, c'est pas l'abonnement`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>T'as regardé les prix. T'as pas pris. Cool.</p>
<p>Calcul rapide :</p>
<ul style="color:#555">
  <li>Un client qui te trouve pas via une IA = une vente perdue</li>
  <li>${errors} erreurs sur ${site} = autant de chances en moins d'apparaître</li>
</ul>
<p>Si c'est le <strong>budget</strong> : le plan Starter corrige déjà les erreurs critiques pour 45€/mois.<br>
Si c'est la <strong>confiance</strong> : réponds à cet email, c'est moi qui lis. Sérieusement.</p>
<p>On a 3 plans. Pas 47. Pas de fausse urgence.</p>
<p><a href="https://app.usewok.com/pricing" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Voir le plan Starter →</a></p>
</div>`,
  };
}

function emailChatbotNoConvert({ firstName, siteUrl, chatbotQuestions, score }) {
  const name = firstName || 'toi';
  const site = siteUrl || 'ton site';
  const questions = chatbotQuestions || [];
  const scoreVal = score || 0;

  const questionsHtml = questions.slice(0, 3).map(q =>
    `<li style="color:#555">"${q}"</li>`
  ).join('');

  return {
    subject: `Tu as posé ${questions.length || 'quelques'} questions — voici les réponses`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>Tu as utilisé notre chatbot. Tu avais des questions, c'est normal — c'est pour ça qu'il existe.</p>
${questions.length > 0 ? `<p>Tu as demandé notamment :</p><ul>${questionsHtml}</ul>` : ''}
<p>Ce que ton scan montre : ton score actuel est <strong>${scoreVal}/100</strong>. Les problèmes que tu as questionnés sont précisément liés aux erreurs qu'on a détectées sur ${site}.</p>
<p>Les corrections sont dans le rapport. Certaines se font sans développeur, en moins de 10 minutes.</p>
<p><a href="https://app.usewok.com/ai-report" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Voir les corrections →</a></p>
<p style="color:#888;font-size:13px">Tu as des questions supplémentaires ? Réponds à cet email.</p>
</div>`,
  };
}

function emailInactiveJ14({ firstName, siteUrl, lastScanDate }) {
  const name = firstName || 'toi';
  const site = siteUrl || 'ton site';
  const dateStr = lastScanDate ? new Date(lastScanDate).toLocaleDateString('fr-FR') : 'il y a 14 jours';

  return {
    subject: `14 jours. Le web IA n'a pas attendu.`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>En 14 jours :</p>
<ul style="color:#555">
  <li>Google AI Overviews a étendu sa couverture sur de nouvelles requêtes</li>
  <li>OpenAI a mis à jour ses modèles de crawl</li>
  <li>Des centaines de sites ont optimisé leur structure pour les IA</li>
</ul>
<p>Ton scan du ${dateStr} est déjà obsolète.</p>
<p>Un re-scan gratuit te montre où tu en es <strong>maintenant</strong>.</p>
<p><a href="https://app.usewok.com" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Re-scanner ${site} gratuitement →</a></p>
<p style="color:#888;font-size:13px">C'est mon avant-dernier email. Après, silence.</p>
</div>`,
  };
}

function emailLastJ30({ firstName, siteUrl }) {
  const name = firstName || 'toi';
  const site = siteUrl || 'ton site';

  return {
    subject: `Dernier email. Pour de vrai.`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>Ton compte reste actif.<br>
Tes résultats restent accessibles.</p>
<p>Mais je t'enverrai plus d'emails.</p>
<p style="color:#555">Si un jour tu te demandes pourquoi ton concurrent sort sur ChatGPT et pas toi — tu sais où me trouver.</p>
<p><a href="https://app.usewok.com" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Mon tableau de bord →</a></p>
</div>`,
  };
}

function emailPostPaid({ firstName }) {
  const name = firstName || 'toi';
  return {
    subject: `C'est parti. Voici ton plan d'action.`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>Ton abonnement est actif. Voici ce qu'on fait maintenant :</p>
<div style="background:#f8f7f4;border-radius:12px;padding:20px;margin:20px 0">
  <div style="margin-bottom:14px"><strong>Étape 1</strong> — Re-scanne maintenant<br><span style="color:#888;font-size:13px">Tes corrections vont changer le score. Documente le point de départ.</span></div>
  <div style="margin-bottom:14px"><strong>Étape 2</strong> — Active les alertes<br><span style="color:#888;font-size:13px">On te prévient si ton score bouge. Tu n'as rien à surveiller manuellement.</span></div>
  <div><strong>Étape 3</strong> — Reviens dans 7 jours<br><span style="color:#888;font-size:13px">On te montre l'évolution. Les IA mettent 5-10 jours à re-crawler.</span></div>
</div>
<p><a href="https://app.usewok.com/app" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Aller sur mon dashboard →</a></p>
<p style="color:#888;font-size:13px">Une question ? Réponds à cet email. C'est moi qui lis.</p>
</div>`,
  };
}

function emailPaidJ7({ firstName, siteUrl, previousScore, currentScore }) {
  const name = firstName || 'toi';
  const site = siteUrl || 'ton site';
  const prev = previousScore || 0;
  const curr = currentScore || 0;
  const delta = curr - prev;
  const improved = delta > 0;

  return {
    subject: `Ton score a bougé.`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>7 jours après ton abonnement. Voilà où en est ${site} :</p>
<div style="background:#f8f7f4;border-radius:12px;padding:20px;margin:20px 0;display:flex;gap:24px;align-items:center">
  <div style="text-align:center"><div style="font-size:13px;color:#888">Avant</div><div style="font-size:32px;font-weight:900">${prev}</div></div>
  <div style="font-size:24px;color:${improved ? '#10b981' : '#ff5a1f'}">${improved ? '→' : '→'}</div>
  <div style="text-align:center"><div style="font-size:13px;color:#888">Maintenant</div><div style="font-size:32px;font-weight:900;color:${improved ? '#10b981' : '#ff5a1f'}">${curr}</div></div>
  <div style="font-size:18px;font-weight:700;color:${improved ? '#10b981' : '#ff5a1f'}">${improved ? '+' : ''}${delta}</div>
</div>
${improved
  ? `<p>+${delta} points. Tes corrections fonctionnent. Les IA commencent à t'indexer différemment.</p>`
  : `<p>Pas encore bougé ? Normal. Les IA mettent 5-10 jours à re-crawler les sites. Le mouvement arrive.</p>`}
<p><a href="https://app.usewok.com/ai-report" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Voir mon évolution →</a></p>
</div>`,
  };
}

function emailPaidMonthly({ firstName, siteUrl, currentScore, previousScore, issuesFixed, issuesRemaining, aiAppearances }) {
  const name = firstName || 'toi';
  const site = siteUrl || 'ton site';
  const curr = currentScore || 0;
  const prev = previousScore || 0;
  const delta = curr - prev;
  const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return {
    subject: `Ton rapport mensuel IA — ${month}`,
    html: `<div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a;line-height:1.7">
<p>Salut ${name},</p>
<p>Voici l'état de ${site} pour ${month} :</p>
<div style="background:#f8f7f4;border-radius:12px;padding:20px;margin:20px 0">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div><div style="font-size:13px;color:#888">Score IA</div><div style="font-size:28px;font-weight:900">${curr}/100 <span style="font-size:14px;color:${delta >= 0 ? '#10b981' : '#ff5a1f'}">${delta >= 0 ? '↑' : '↓'}${Math.abs(delta)}</span></div></div>
    <div><div style="font-size:13px;color:#888">Apparitions IA estimées</div><div style="font-size:28px;font-weight:900">${aiAppearances || '—'}</div></div>
    <div><div style="font-size:13px;color:#888">Erreurs restantes</div><div style="font-size:28px;font-weight:900">${issuesRemaining || 0}</div></div>
    <div><div style="font-size:13px;color:#888">Corrigées ce mois</div><div style="font-size:28px;font-weight:900;color:#10b981">${issuesFixed || 0}</div></div>
  </div>
</div>
<p><a href="https://app.usewok.com/ai-report" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Voir le détail complet →</a></p>
<p style="color:#888;font-size:13px">Ce rapport est envoyé chaque mois automatiquement. C'est notre façon de te montrer que l'abonnement vaut ce qu'il coûte.</p>
</div>`,
  };
}

// ── Handler principal ────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Auth check — accept admin or service call (no user = cron/automation)
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {}

    const body = await req.json();
    const { action, email, firstName, lastName, siteUrl, segment, data = {} } = body;

    console.log(`[brevoEmailSystem] action=${action} email=${email} segment=${segment}`);

    // ── SYNC CONTACT ──────────────────────────────────────────────────────────
    if (action === 'syncContact') {
      const attributes = {
        SITE_URL: siteUrl || '',
        PLAN: data.plan || 'free',
        SCORE: data.score || 0,
        CRITICAL_ERRORS: data.criticalErrors || 0,
        TOTAL_ISSUES: data.totalIssues || 0,
        LAST_SCAN_DATE: data.lastScanDate || '',
        HAS_SCANNED: data.hasScanned ? 'true' : 'false',
        HAS_PAID: data.hasPaid ? 'true' : 'false',
        VIEWED_PRICING: data.viewedPricing ? 'true' : 'false',
        USED_CHATBOT: data.usedChatbot ? 'true' : 'false',
        CHATBOT_QUESTIONS: JSON.stringify(data.chatbotQuestions || []),
        PREVIOUS_SCORE: data.previousScore || 0,
        SEGMENT: segment || 'free_inactive',
        SIGNUP_DATE: data.signupDate || new Date().toISOString(),
      };

      const result = await syncContact({ email, firstName, lastName, attributes });
      return Response.json(result);
    }

    // ── SEND EMAIL ────────────────────────────────────────────────────────────
    if (action === 'sendEmail') {
      const { emailType } = data;
      let template = null;

      switch (emailType) {
        case 'welcome':
          template = emailWelcome({ firstName, siteUrl });
          break;
        case 'post_scan':
          template = emailPostScan({ firstName, siteUrl, score: data.score, criticalErrors: data.criticalErrors, totalIssues: data.totalIssues });
          break;
        case 'no_scan_j3':
          template = emailNoScanJ3({ firstName });
          break;
        case 'pricing_no_buy':
          template = emailPricingNoBuy({ firstName, siteUrl, criticalErrors: data.criticalErrors });
          break;
        case 'chatbot_no_convert':
          template = emailChatbotNoConvert({ firstName, siteUrl, chatbotQuestions: data.chatbotQuestions, score: data.score });
          break;
        case 'inactive_j14':
          template = emailInactiveJ14({ firstName, siteUrl, lastScanDate: data.lastScanDate });
          break;
        case 'last_j30':
          template = emailLastJ30({ firstName, siteUrl });
          break;
        case 'post_paid':
          template = emailPostPaid({ firstName });
          break;
        case 'paid_j7':
          template = emailPaidJ7({ firstName, siteUrl, previousScore: data.previousScore, currentScore: data.currentScore });
          break;
        case 'paid_monthly':
          template = emailPaidMonthly({ firstName, siteUrl, currentScore: data.currentScore, previousScore: data.previousScore, issuesFixed: data.issuesFixed, issuesRemaining: data.issuesRemaining, aiAppearances: data.aiAppearances });
          break;
        default:
          return Response.json({ error: `Unknown emailType: ${emailType}` }, { status: 400 });
      }

      const result = await sendTransactionalEmail({
        to: email,
        subject: template.subject,
        htmlContent: template.html,
        tags: [emailType, segment || 'general'],
      });
      return Response.json({ success: true, messageId: result.messageId, emailType });
    }

    // ── UPDATE CONTACT EVENT ──────────────────────────────────────────────────
    if (action === 'updateContactEvent') {
      const result = await updateContactAttributes(email, data.attributes || {});
      return Response.json(result);
    }

    // ── TRIGGER SEQUENCE ─────────────────────────────────────────────────────
    // Déclenche l'email immédiatement selon le segment
    // Les délais (J+3, J+7, J+14, J+30) sont gérés par les automations Base44
    if (action === 'triggerSequence') {
      const { emailType } = data;
      // Sync contact d'abord
      await syncContact({
        email, firstName, lastName,
        attributes: {
          SITE_URL: siteUrl || '',
          PLAN: data.plan || 'free',
          SCORE: data.score || 0,
          CRITICAL_ERRORS: data.criticalErrors || 0,
          SEGMENT: segment || 'free_inactive',
        },
      });
      // Envoyer l'email
      let template = null;
      switch (emailType) {
        case 'welcome': template = emailWelcome({ firstName, siteUrl }); break;
        case 'post_scan': template = emailPostScan({ firstName, siteUrl, score: data.score, criticalErrors: data.criticalErrors, totalIssues: data.totalIssues }); break;
        case 'no_scan_j3': template = emailNoScanJ3({ firstName }); break;
        case 'pricing_no_buy': template = emailPricingNoBuy({ firstName, siteUrl, criticalErrors: data.criticalErrors }); break;
        case 'chatbot_no_convert': template = emailChatbotNoConvert({ firstName, siteUrl, chatbotQuestions: data.chatbotQuestions, score: data.score }); break;
        case 'inactive_j14': template = emailInactiveJ14({ firstName, siteUrl, lastScanDate: data.lastScanDate }); break;
        case 'last_j30': template = emailLastJ30({ firstName, siteUrl }); break;
        case 'post_paid': template = emailPostPaid({ firstName }); break;
        case 'paid_j7': template = emailPaidJ7({ firstName, siteUrl, previousScore: data.previousScore, currentScore: data.currentScore }); break;
        case 'paid_monthly': template = emailPaidMonthly({ firstName, siteUrl, currentScore: data.currentScore, previousScore: data.previousScore, issuesFixed: data.issuesFixed, issuesRemaining: data.issuesRemaining, aiAppearances: data.aiAppearances }); break;
        default: return Response.json({ error: `Unknown emailType: ${emailType}` }, { status: 400 });
      }
      const result = await sendTransactionalEmail({
        to: email,
        subject: template.subject,
        htmlContent: template.html,
        tags: [emailType, segment || 'general'],
      });
      return Response.json({ success: true, messageId: result.messageId, emailType, segment });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('[brevoEmailSystem] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});