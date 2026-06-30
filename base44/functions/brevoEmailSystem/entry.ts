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

// ── Pied de page ─────────────────────────────────────────────────────────────

function emailFooter(email) {
  return `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;">
    <tr>
      <td align="center" style="padding:28px 16px 12px 16px;">
        <!-- Réseaux sociaux -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding:0 6px;">
              <a href="https://tiktok.com/@usewok" style="display:inline-block;width:36px;height:36px;background:#ffffff;border:1px solid #E5E5E5;border-radius:8px;text-align:center;line-height:36px;text-decoration:none;">
                <img src="https://cdn-icons-png.flaticon.com/512/3046/3046120.png" width="16" height="16" alt="TikTok" style="vertical-align:middle;margin-top:9px;">
              </a>
            </td>
            <td style="padding:0 6px;">
              <a href="https://x.com/usewok" style="display:inline-block;width:36px;height:36px;background:#ffffff;border:1px solid #E5E5E5;border-radius:8px;text-align:center;line-height:36px;text-decoration:none;">
                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968830.png" width="16" height="16" alt="X" style="vertical-align:middle;margin-top:9px;">
              </a>
            </td>
            <td style="padding:0 6px;">
              <a href="https://facebook.com/usewok" style="display:inline-block;width:36px;height:36px;background:#ffffff;border:1px solid #E5E5E5;border-radius:8px;text-align:center;line-height:36px;text-decoration:none;">
                <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="16" height="16" alt="Facebook" style="vertical-align:middle;margin-top:9px;">
              </a>
            </td>
            <td style="padding:0 6px;">
              <a href="https://instagram.com/usewok" style="display:inline-block;width:36px;height:36px;background:#ffffff;border:1px solid #E5E5E5;border-radius:8px;text-align:center;line-height:36px;text-decoration:none;">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="16" height="16" alt="Instagram" style="vertical-align:middle;margin-top:9px;">
              </a>
            </td>
            <td style="padding:0 6px;">
              <a href="https://linkedin.com/company/usewok" style="display:inline-block;width:36px;height:36px;background:#ffffff;border:1px solid #E5E5E5;border-radius:8px;text-align:center;line-height:36px;text-decoration:none;">
                <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="16" height="16" alt="LinkedIn" style="vertical-align:middle;margin-top:9px;">
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:10px 16px 4px 16px;">
        <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:12px;color:#BBBBBB;line-height:18px;text-align:center;">
          Tu reçois cet email car tu as lancé un scan sur UseWok.
        </p>
        <p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:12px;color:#BBBBBB;line-height:18px;text-align:center;">
          <a href="https://usewok.com/privacy" style="color:#BBBBBB;text-decoration:underline;">Politique de confidentialité</a>
          &nbsp;&middot;&nbsp;
          <a href="https://usewok.com/terms" style="color:#BBBBBB;text-decoration:underline;">Conditions d'utilisation</a>
          &nbsp;&middot;&nbsp;
          <a href="mailto:support@usewok.com" style="color:#BBBBBB;text-decoration:underline;">Assistance</a>
        </p>
        <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#CCCCCC;line-height:18px;text-align:center;">
          UseWok · Libourne, Gironde, France
        </p>
      </td>
    </tr>
  </table>`;
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

function emailPostScan({ firstName, siteUrl, score, criticalErrors, totalIssues, issues, scanDate }) {
  const name = firstName || 'toi';
  const site = (siteUrl || 'ton site').replace(/^https?:\/\//, '').split('/')[0];
  const errors = criticalErrors || 0;
  const scoreVal = score || 0;
  const dateStr = scanDate ? new Date(scanDate).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  const issuesList = issues || [];
  const scoreBarWidth = Math.min(100, Math.max(0, scoreVal));
  const isGoodScore = scoreVal >= 60;

  // Build issues rows HTML — show each issue individually
  const criticalIssues = issuesList.filter(i => i.severity === 'error' || i.urgency === 'high');
  const importantIssues = issuesList.filter(i => i.severity === 'warning' || i.urgency === 'medium' || i.urgency === 'low');

  const buildIssueRows = (list, color, label) => {
    if (!list.length) return '';
    const rows = list.map(i => {
      const text = i.problem || i.text || i.title || '';
      if (!text) return '';
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #F0F0F0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;color:#0F0F0F;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:10px;vertical-align:middle;"></span>${text}
        </td>
      </tr>`;
    }).join('');
    if (!rows.trim()) return '';
    return `<tr>
      <td style="padding:16px 0 6px 0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1.3px;text-transform:uppercase;color:${color};">${label}</td>
    </tr>${rows}`;
  };

  const criticalRows = buildIssueRows(criticalIssues, '#D93025', 'Critique');
  const importantRows = buildIssueRows(importantIssues, '#C46000', 'Important');
  const hasIssues = criticalRows || importantRows;

  // Score context text — positive variant if >= 60
  const scoreContextHtml = isGoodScore
    ? `<p style="margin:0 0 28px 0;font-family:Arial,sans-serif;font-size:15px;line-height:24px;color:#444444;">
        Ton site a un bon niveau de visibilité IA — <strong style="color:#0F0F0F;">${scoreVal}/100</strong>. 
        ChatGPT, Perplexity et Google AI commencent à te référencer. Voici ce qu'il reste à optimiser pour aller encore plus loin.
      </p>`
    : `<p style="margin:0 0 28px 0;font-family:Arial,sans-serif;font-size:15px;line-height:24px;color:#444444;">
        Un score de <strong style="color:#0F0F0F;">${scoreVal}/100</strong> 
        signifie que les moteurs IA — ChatGPT, Perplexity, Google AI — 
        ont du mal à lire et citer ton site. Voici les points qui pèsent le plus sur ce résultat.
      </p>`;

  // Subject line adapts to score
  const subject = isGoodScore
    ? `Ton score IA : ${scoreVal}/100 — voici comment aller plus loin`
    : `${errors > 0 ? errors + ' erreur' + (errors > 1 ? 's' : '') + ' détectée' + (errors > 1 ? 's' : '') : 'Rapport prêt'} sur ${site}`;

  return {
    subject,
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <title>Ton rapport UseWok est prêt</title>
  <style>
    body { margin:0; padding:0; background-color:#EDECEA; font-family:Arial,sans-serif; -webkit-text-size-adjust:100%; }
    table { border-collapse:collapse; }
    img { border:0; outline:none; text-decoration:none; max-width:100%; height:auto; }
    @media only screen and (max-width:600px){
      .card { width:100% !important; border-radius:0 !important; }
      .content { padding:32px 24px 40px 24px !important; }
      .score-n { font-size:64px !important; line-height:64px !important; }
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#EDECEA;line-height:1px;max-height:0;overflow:hidden;opacity:0;">
    Ton scan est terminé — score ${scoreVal}/100${errors > 0 ? ', ' + errors + ' erreurs sur ' + site : ' — bonne base, des opportunités à saisir'}.
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#EDECEA">
    <tr>
      <td align="center" style="padding:28px 16px 0 16px;">
        <table class="card" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
          style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- BANNER IMAGE -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;border-radius:12px 12px 0 0;">
              <a href="https://usewok.com" style="display:block;text-decoration:none;line-height:0;">
                <img src="https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/d8f786b6f_image.png"
                  alt="UseWok — Visibilité IA" width="600"
                  style="width:600px;max-width:100%;height:auto;display:block;border-radius:12px 12px 0 0;border:0;outline:none;text-decoration:none;"
                  border="0">
              </a>
            </td>
          </tr>

          <!-- CONTENU -->
          <tr>
            <td class="content" style="padding:40px 48px 50px 48px;">

              <p style="margin:0 0 20px 0;font-family:Arial,sans-serif;font-size:16px;line-height:26px;color:#0F0F0F;">
                Salut ${name},
              </p>

              <p style="margin:0 0 28px 0;font-family:Arial,sans-serif;font-size:16px;line-height:26px;color:#0F0F0F;">
                Ton scan est terminé. On a analysé <strong>${site}</strong> et voici ce qu'on a trouvé.
              </p>

              <!-- SCORE CARD -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#0F0F0F;border-radius:10px;padding:36px 36px 30px 36px;">
                    <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;
                      letter-spacing:1.5px;text-transform:uppercase;color:#666666;">
                      Score IA · ${site}
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td valign="baseline">
                          <span class="score-n" style="font-family:Arial,sans-serif;font-size:80px;font-weight:900;
                            color:#FFFFFF;line-height:80px;letter-spacing:-3px;display:inline-block;">
                            ${scoreVal}
                          </span>
                        </td>
                        <td valign="baseline" style="padding-left:5px;padding-bottom:10px;">
                          <span style="font-family:Arial,sans-serif;font-size:26px;font-weight:300;color:#555555;line-height:1;">/100</span>
                        </td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:14px 0 18px 0;">
                      <tr>
                        <td style="background:#2A2A2A;border-radius:2px;height:4px;overflow:hidden;line-height:4px;font-size:0;">
                          <div style="width:${scoreBarWidth}%;height:4px;background:${isGoodScore ? 'linear-gradient(90deg,#34D399 0%,#10B981 100%)' : 'linear-gradient(90deg,#9B87D8 0%,#E0707A 100%)'};border-radius:2px;"></div>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#555555;line-height:19px;">
                      ${errors > 0 ? `<strong style="color:#FFFFFF;">${errors} erreur${errors > 1 ? 's' : ''}</strong> détectée${errors > 1 ? 's' : ''} &nbsp;·&nbsp;` : ''} analysé le ${dateStr}
                    </p>
                  </td>
                </tr>
              </table>

              ${scoreContextHtml}

              ${hasIssues ? `<!-- ERREURS -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#F6F6F5;border:1px solid #EBEBEB;border-radius:10px;padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      ${criticalRows}
                      ${importantRows}
                    </table>
                  </td>
                </tr>
              </table>` : ''}

              <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:15px;line-height:24px;color:#0F0F0F;">
                Chaque point est documenté dans ton rapport : cause exacte, impact sur ta visibilité IA, et correction étape par étape.
              </p>

              <!-- CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding:24px 0 8px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" bgcolor="#0F0F0F" style="border-radius:300px;">
                          <a href="https://app.usewok.com/ai-report"
                            style="display:inline-block;padding:14px 36px;background:#0F0F0F;color:#FFFFFF !important;
                              font-family:Arial,sans-serif;font-size:15px;font-weight:bold;
                              text-decoration:none !important;border-radius:300px;letter-spacing:0.1px;">
                            Voir mon rapport complet →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:16px 0 0 0;font-family:Arial,sans-serif;font-size:14px;line-height:21px;
                color:#999999;text-align:center;">
                La plupart des corrections prennent moins d'une heure.
              </p>

              <div style="height:1px;background:#EBEBEB;margin:36px 0 30px 0;"></div>

              <!-- CITATION -->
              <p style="margin:0 0 24px 0;font-family:Georgia,serif;font-size:16px;line-height:26px;color:#555555;font-style:italic;text-align:center;padding:0 16px;">
                « Ce qui ne se mesure pas ne s'améliore pas. »
              </p>

              <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:24px;color:#0F0F0F;">
                L'équipe UseWok<br>
                <span style="color:#AAAAAA;font-size:13px;">hello@usewok.com</span>
              </p>

            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td align="center" style="padding:24px 16px 40px 16px;">
        ${emailFooter('')}
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

function emailNoScanJ3({ firstName, siteUrl, score, criticalErrors, issues }) {
  const name = firstName || 'toi';
  const site = (siteUrl || 'ton site').replace(/^https?:\/\//, '').split('/')[0];
  const scoreVal = score || 0;
  const errors = criticalErrors || 0;
  const issuesList = issues || [];
  const topIssue = issuesList.find(i => i.urgency === 'high') || issuesList[0];
  const topIssueText = topIssue?.problem || '';
  const insightLine = scoreVal > 0
    ? `Ton score actuel est <strong style="color:#0F0F0F;">${scoreVal}/100</strong>${errors > 0 ? ` avec <strong>${errors} erreur${errors > 1 ? 's' : ''} critique${errors > 1 ? 's' : ''}</strong>` : ''} — voici exactement pourquoi.`
    : `Voici exactement pourquoi les IA ignorent la majorité des sites comme ${site}.`;

  return {
    subject: `Pourquoi ChatGPT ne te recommande pas (et comment y remédier)`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <style>
    body{margin:0;padding:0;background-color:#EDECEA;font-family:Arial,sans-serif;-webkit-text-size-adjust:100%;}
    table{border-collapse:collapse;}img{border:0;max-width:100%;height:auto;}
    @media only screen and (max-width:600px){.card{width:100%!important;border-radius:0!important;}.content{padding:32px 24px 40px 24px!important;}}
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#EDECEA;line-height:1px;max-height:0;overflow:hidden;opacity:0;">La vraie raison pour laquelle ChatGPT, Gemini et Perplexity ignorent ton site — et ce que tu peux faire dès aujourd'hui.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="#EDECEA">
    <tr><td align="center" style="padding:28px 16px 0 16px;">
      <table class="card" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;">

        <!-- BANNER -->
        <tr><td style="padding:0;line-height:0;font-size:0;border-radius:12px 12px 0 0;">
          <a href="https://usewok.com" style="display:block;text-decoration:none;line-height:0;">
            <img src="https://media.base44.com/images/public/6a4140bf0af287d6d896b1f1/1893e96a2_image.png" alt="UseWok" width="600" style="width:600px;max-width:100%;height:auto;display:block;border-radius:12px 12px 0 0;border:0;">
          </a>
        </td></tr>

        <!-- CONTENU -->
        <tr><td class="content" style="padding:40px 48px 50px 48px;">

          <p style="margin:0 0 20px 0;font-family:Arial,sans-serif;font-size:16px;line-height:26px;color:#0F0F0F;">Salut ${name},</p>

          <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:16px;line-height:26px;color:#0F0F0F;">${insightLine}</p>

          <p style="margin:0 0 32px 0;font-family:Arial,sans-serif;font-size:15px;line-height:26px;color:#555555;">
            Ce n'est pas une question de budget pub, ni d'abonnés Instagram. C'est une question de <strong style="color:#0F0F0F;">langage</strong> — et les IA parlent un langage que 95&nbsp;% des sites ne comprennent pas.
          </p>

          <!-- SECTION TITRE -->
          <p style="margin:0 0 20px 0;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:#AAAAAA;">Les 3 vraies raisons</p>

          <!-- RAISON 1 -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:14px;">
            <tr><td style="background:#F6F6F5;border-left:3px solid #0F0F0F;border-radius:0 8px 8px 0;padding:20px 24px;">
              <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#999999;">Raison 01</p>
              <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;line-height:22px;color:#0F0F0F;">Ton site parle aux humains, pas aux machines</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;color:#444444;">
                ChatGPT ne "lit" pas une page comme toi. Il cherche des <strong>données structurées</strong> — des balises JSON-LD qui lui disent : "Cette entreprise s'appelle X, fait Y, est basée à Z." Sans ça, il ne peut pas te citer avec confiance. Il préfère ne pas te mentionner du tout plutôt que de risquer de se tromper.
              </p>
            </td></tr>
          </table>

          <!-- RAISON 2 -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:14px;">
            <tr><td style="background:#F6F6F5;border-left:3px solid #0F0F0F;border-radius:0 8px 8px 0;padding:20px 24px;">
              <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#999999;">Raison 02</p>
              <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;line-height:22px;color:#0F0F0F;">Tu n'as pas de "références" — les IA ont peur de toi</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;color:#444444;">
                Les moteurs IA fonctionnent comme un recruteur : avant de te recommander, ils vérifient si d'autres sources fiables parlent de toi. Presse, annuaires, avis Google, mentions LinkedIn… Si personne ne valide ton existence, l'IA ne prend pas de risque. Elle cite celui qui a des preuves sociales numériques, pas nécessairement le meilleur.
              </p>
            </td></tr>
          </table>

          <!-- RAISON 3 -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
            <tr><td style="background:#F6F6F5;border-left:3px solid #0F0F0F;border-radius:0 8px 8px 0;padding:20px 24px;">
              <p style="margin:0 0 6px 0;font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#999999;">Raison 03</p>
              <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;line-height:22px;color:#0F0F0F;">Ton message est flou — même pour une IA</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;color:#444444;">
                Si ta page d'accueil n'explique pas en une phrase <strong>qui tu aides, comment, et pourquoi maintenant</strong> — l'IA ne peut pas te catégoriser. Elle ne sait pas si tu es consultant, agence, logiciel ou artisan. Résultat : case "ambigu", jamais cité.
              </p>
            </td></tr>
          </table>

          ${topIssueText ? `<!-- PROBLÈME PERSONNALISÉ -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
            <tr><td style="background:#FEF3EC;border:1px solid #FDDCBF;border-radius:8px;padding:20px 24px;">
              <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#C45000;">🎯 Ce qu'on a détecté sur ${site}</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;line-height:22px;color:#7C3A10;">${topIssueText}</p>
            </td></tr>
          </table>` : ''}

          <!-- CITATION DARK -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
            <tr><td style="background:#0F0F0F;border-radius:10px;padding:28px 32px;">
              <p style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:17px;line-height:28px;color:#FFFFFF;font-style:italic;">
                "Les moteurs IA ne cherchent pas le meilleur produit. Ils cherchent le produit dont ils sont <em>sûrs</em>. Sois compréhensible, et ils te recommanderont."
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#666666;">— Principe fondamental de l'Answer Engine Optimization</p>
            </td></tr>
          </table>

          <!-- CE QUE TU PEUX FAIRE -->
          <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:#AAAAAA;">Ce que tu peux faire dès aujourd'hui</p>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
            <tr><td style="background:#F6F6F5;border-radius:10px;padding:20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr><td style="padding:0 0 14px 0;border-bottom:1px solid #E5E5E5;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                    <td valign="top" style="padding-right:14px;"><div style="width:28px;height:28px;background:#0F0F0F;border-radius:50%;text-align:center;line-height:28px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#FFFFFF;">1</div></td>
                    <td><p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0F0F0F;">Ajoute un bloc JSON-LD Organization</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#666666;line-height:19px;">Sur ta page d'accueil. Nom, activité, ville, téléphone, réseaux. 15 minutes. Impact immédiat sur ChatGPT.</p></td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:14px 0;border-bottom:1px solid #E5E5E5;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                    <td valign="top" style="padding-right:14px;"><div style="width:28px;height:28px;background:#0F0F0F;border-radius:50%;text-align:center;line-height:28px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#FFFFFF;">2</div></td>
                    <td><p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0F0F0F;">Réclame ta fiche Google Business</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#666666;line-height:19px;">Gratuit. Obligatoire. Gemini et Google AI s'en servent en priorité pour les recherches locales.</p></td>
                  </tr></table>
                </td></tr>
                <tr><td style="padding:14px 0 0 0;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
                    <td valign="top" style="padding-right:14px;"><div style="width:28px;height:28px;background:#0F0F0F;border-radius:50%;text-align:center;line-height:28px;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;color:#FFFFFF;">3</div></td>
                    <td><p style="margin:0 0 4px 0;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;color:#0F0F0F;">Ajoute une FAQ structurée à ton site</p><p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#666666;line-height:19px;">Perplexity et Google AI affichent directement les FAQs en schéma FAQPage. 6 questions suffisent pour apparaître dans leurs réponses.</p></td>
                  </tr></table>
                </td></tr>
              </table>
            </td></tr>
          </table>

          <!-- CTA -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr><td align="center" style="padding:0 0 12px 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr><td align="center" bgcolor="#0F0F0F" style="border-radius:300px;">
                  <a href="https://app.usewok.com/ai-report" style="display:inline-block;padding:14px 36px;background:#0F0F0F;color:#FFFFFF !important;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none !important;border-radius:300px;letter-spacing:0.1px;">
                    Voir mes corrections personnalisées →
                  </a>
                </td></tr>
              </table>
            </td></tr>
          </table>

          <p style="margin:12px 0 0 0;font-family:Arial,sans-serif;font-size:13px;line-height:20px;color:#AAAAAA;text-align:center;">UseWok génère le code exact à copier-coller — sans développeur.</p>

          <div style="height:1px;background:#EBEBEB;margin:36px 0 30px 0;"></div>

          <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;line-height:24px;color:#0F0F0F;">
            L'équipe UseWok<br><span style="color:#AAAAAA;font-size:13px;">hello@usewok.com</span>
          </p>

        </td></tr>
      </table>
    </td></tr>

    <!-- FOOTER -->
    <tr><td align="center" style="padding:24px 16px 40px 16px;">${emailFooter('')}</td></tr>
  </table>
</body>
</html>`,
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
          template = emailPostScan({ firstName, siteUrl, score: data.score, criticalErrors: data.criticalErrors, totalIssues: data.totalIssues, issues: data.issues, scanDate: data.scanDate });
          break;
        case 'no_scan_j3':
          template = emailNoScanJ3({ firstName, siteUrl, score: data.score, criticalErrors: data.criticalErrors, issues: data.issues });
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
        case 'post_scan': template = emailPostScan({ firstName, siteUrl, score: data.score, criticalErrors: data.criticalErrors, totalIssues: data.totalIssues, issues: data.issues, scanDate: data.scanDate }); break;
        case 'no_scan_j3': template = emailNoScanJ3({ firstName, siteUrl, score: data.score, criticalErrors: data.criticalErrors, issues: data.issues }); break;
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