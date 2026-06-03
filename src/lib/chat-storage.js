// Chat storage — cloud-first, localStorage as fast cache
import { base44 } from '@/api/base44Client';

// ─── Local cache helpers (fast reads) ───────────────────────────────────────

export const getLocalDiscussions = (workspaceId) => {
  try {
    const raw = localStorage.getItem(`wok_discussions_${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveLocalDiscussions = (workspaceId, data) => {
  try {
    localStorage.setItem(`wok_discussions_${workspaceId}`, JSON.stringify(data));
  } catch {}
};

export const getConversationMessages = (conversationId) => {
  try {
    const raw = localStorage.getItem(`wok_messages_${conversationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveConversationMessages = (conversationId, messages) => {
  try {
    localStorage.setItem(`wok_messages_${conversationId}`, JSON.stringify(messages));
  } catch {}
};

// ─── Cloud sync ──────────────────────────────────────────────────────────────

/**
 * Save a conversation (messages + preview content) to the cloud DB.
 * This is the source of truth — called after every AI response.
 */
export async function syncToCloud(convId, messages, meta = {}) {
  try {
    const data = {
      conv_id: convId,
      messages_json: JSON.stringify(messages),
      title: meta.title || 'New Chat',
      preview: meta.preview || (messages[messages.length - 1]?.content || '').slice(0, 120),
      is_public: meta.is_public || false,
      model: meta.model || 'default',
      agent: meta.agent || 'default',
      // Store generated UI code for cross-device preview restore
      raw_content: meta.rawContent || undefined,
    };

    // Clean up undefined fields
    Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

    const results = await base44.entities.Conversation.filter({ conv_id: convId });
    if (results.length > 0) {
      await base44.entities.Conversation.update(results[0].id, data);
    } else {
      await base44.entities.Conversation.create(data);
    }
  } catch (err) {
    console.error('Cloud sync failed:', err);
  }
}

/**
 * Load a conversation from cloud. Returns { messages, rawContent } or null.
 */
export async function loadFromCloud(convId) {
  try {
    let me = null;
    try { me = await base44.auth.me(); } catch {}

    let record = null;

    if (me?.email) {
      const results = await base44.entities.Conversation.filter({ conv_id: convId });
      if (results.length > 0) record = results[0];
    }

    if (!record) {
      // fallback: public
      const pub = await base44.entities.Conversation.filter({ conv_id: convId, is_public: true });
      if (pub.length > 0) record = pub[0];
    }

    if (!record) return null;

    const messages = record.messages_json ? JSON.parse(record.messages_json) : [];
    const rawContent = record.raw_content || record.description || null;

    return { messages, rawContent, title: record.title, is_public: record.is_public };
  } catch (err) {
    console.error('Cloud load failed:', err);
    return null;
  }
}

/**
 * Load the full list of conversations for the current user from cloud.
 * Returns array of { id, title, preview, updatedAt }.
 */
export async function loadDiscussionsFromCloud() {
  try {
    const me = await base44.auth.me();
    if (!me?.email) return [];
    const results = await base44.entities.Conversation.list('-updated_date', 50);
    return results.map(r => ({
      id: r.conv_id,
      title: r.title || 'Untitled',
      preview: r.preview || '',
      date: r.updated_date?.slice(0, 10) || '',
      updatedAt: new Date(r.updated_date || r.created_date).getTime(),
      emoji: '💬',
    }));
  } catch { return []; }
}