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
 * Register a brand-new conversation in cloud immediately (before any AI response).
 * Call this at the start of a new chat to guarantee cloud persistence.
 */
export async function createConversationInCloud(convId, title = 'New Chat') {
  try {
    const existing = await base44.entities.Conversation.filter({ conv_id: convId });
    if (existing.length > 0) return existing[0];
    return await base44.entities.Conversation.create({
      conv_id: convId,
      title,
      preview: '',
      is_public: false,
      messages_json: '[]',
      model: 'default',
      agent: 'default',
    });
  } catch (err) {
    console.error('Cloud create failed:', err);
    return null;
  }
}

/**
 * Save a conversation (messages + preview content) to the cloud DB.
 * This is the source of truth — called after every AI response.
 */
export async function syncToCloud(convId, messages, meta = {}) {
  try {
    // Serialize messages but strip rawContent from each message to keep messages_json small
    // rawContent is stored separately in raw_content field
    const msgsForStorage = messages.map(m => {
      if (m.role === 'assistant' && m.rawContent) {
        const { rawContent, ...rest } = m;
        return rest;
      }
      return m;
    });

    const data = {
      conv_id: convId,
      messages_json: JSON.stringify(msgsForStorage),
      title: meta.title || 'New Chat',
      preview: meta.preview || (messages[messages.length - 1]?.content || '').slice(0, 120),
    };

    // Always save the latest rawContent (the preview code) if provided
    if (meta.rawContent) {
      data.raw_content = meta.rawContent;
    }

    // Only set is_public if explicitly passed, never override
    if (meta.is_public !== undefined) data.is_public = meta.is_public;

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
    // SECURITY: only load conversations belonging to the authenticated user
    const me = await base44.auth.me();
    if (!me?.id) return null;

    const results = await base44.entities.Conversation.filter({ conv_id: convId });
    if (results.length === 0) return null;

    const record = results[0];

    // Double-check ownership (RLS should already enforce this, but belt-and-suspenders)
    if (record.created_by_id && record.created_by_id !== me.id) return null;

    const messages = record.messages_json ? JSON.parse(record.messages_json) : [];
    const rawContent = record.raw_content || null;
    const rawContentUrl = record.raw_content_url || null;
    const thumbnailUrl = record.thumbnail_url || null;

    return { messages, rawContent, rawContentUrl, thumbnailUrl, title: record.title, is_public: record.is_public };
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
    if (!me?.id) return [];
    // SECURITY: filter strictly by current user's id
    const results = await base44.entities.Conversation.filter({ created_by_id: me.id }, '-updated_date', 100);
    return results
      .filter(r => r.conv_id) // only valid conversations
      .map(r => ({
        id: r.conv_id,
        title: r.title || 'Untitled',
        preview: r.preview || '',
        date: r.updated_date?.slice(0, 10) || r.created_date?.slice(0, 10) || '',
        updatedAt: new Date(r.updated_date || r.created_date || Date.now()).getTime(),
        thumbnail_url: r.thumbnail_url || null,
        emoji: '💬',
      }));
  } catch { return []; }
}