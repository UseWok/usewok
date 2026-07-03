/**
 * Quota Enforcement — Bloque dur quand l'utilisateur dépasse ses limites.
 * Aucun contournement possible côté frontend : si quota atteint → action coupée.
 */

import { base44 } from '@/api/base44Client';
import { getWokFeatures } from '@/lib/wok-plans';

/**
 * Vérifie le quota de scans pour la période en cours.
 * @returns {allowed, used, limit, period}
 */
export async function checkScanQuota(user) {
  const features = getWokFeatures(user);
  const limit = features.scans_per_period ?? 1;
  const period = features.scan_period || 'month';

  if (limit <= 0) return { allowed: false, used: 0, limit, period };

  const now = new Date();
  const periodStart = period === 'day'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    : new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  try {
    const ledger = await base44.entities.CreditLedger.filter({ user_id: user.id, action: 'SCAN' });
    const used = (ledger || []).filter(l => {
      const ts = l.timestamp ? new Date(l.timestamp).getTime() : 0;
      return ts >= periodStart;
    }).length;
    return { allowed: used < limit, used, limit, period };
  } catch {
    return { allowed: true, used: 0, limit, period };
  }
}

/**
 * Vérifie le quota de messages chatbot pour le mois en cours.
 * @returns {allowed, used, limit}
 */
export async function checkChatQuota(user) {
  const features = getWokFeatures(user);
  const limit = features.chatbot_messages ?? 5;

  if (limit <= 0) return { allowed: false, used: 0, limit };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  try {
    const convs = await base44.entities.Conversation.list('-updated_at', 100);
    const used = (convs || []).reduce((acc, conv) => {
      let msgs = [];
      try { msgs = JSON.parse(conv.messages_json || '[]'); } catch { msgs = []; }
      return acc + msgs.filter(m => m.role === 'user' && (m.ts || 0) >= monthStart).length;
    }, 0);
    return { allowed: used < limit, used, limit };
  } catch {
    return { allowed: true, used: 0, limit };
  }
}

/**
 * Vérifie le quota de sites surveillés simultanément.
 * @returns {allowed, used, limit}
 */
export async function checkSiteQuota(user) {
  const features = getWokFeatures(user);
  const limit = features.max_sites ?? 1;

  if (limit <= 0) return { allowed: false, used: 0, limit };

  try {
    const profiles = await base44.entities.BusinessProfile.filter({ created_by_id: user.id });
    const used = (profiles || []).length;
    return { allowed: used < limit, used, limit };
  } catch {
    return { allowed: true, used: 0, limit };
  }
}