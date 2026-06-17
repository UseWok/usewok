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
    const rawContent = meta.rawContent || null;

    // Strip rawContent from all messages — stored separately in raw_content field
    // This keeps messages_json small and prevents the 400KB field size error
    const msgsForStorage = messages.map(m => {
      if (m.role === 'assistant' && m.rawContent) {
        const { rawContent: _rc, ...rest } = m;
        return rest;
      }
      return m;
    });

    // Truncate content field in messages to avoid bloat (keep only first 500 chars per message)
    const msgsCompact = msgsForStorage.map(m => {
      if (m.role === 'assistant' && typeof m.content === 'string' && m.content.length > 500) {
        return { ...m, content: m.content.slice(0, 500) };
      }
      return m;
    });

    const msgsJson = JSON.stringify(msgsCompact);
    const data = {
      conv_id: convId,
      title: meta.title || 'New Chat',
      preview: meta.preview || (messages[messages.length - 1]?.content || '').slice(0, 120),
    };

    // Upload messages_json as file if too large (> 80KB — field DB limit is ~100KB)
    if (msgsJson.length > 80_000) {
      try {
        const blob = new Blob([msgsJson], { type: 'application/json' });
        const file = new File([blob], 'messages.json', { type: 'application/json' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        data.messages_json_url = file_url;
        data.messages_json = msgsJson.slice(0, 80_000); // partial fallback
      } catch {
        data.messages_json = msgsJson.slice(0, 80_000);
      }
    } else {
      data.messages_json = msgsJson;
    }

    // Save rawContent — always upload as file (raw_content field has a very low limit)
    if (rawContent) {
      try {
        const blob = new Blob([rawContent], { type: 'text/plain' });
        const file = new File([blob], 'raw_content.jsx', { type: 'text/plain' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        data.raw_content_url = file_url;
        // Do NOT write raw_content inline — it will exceed the field size limit
        data.raw_content = '';
      } catch {
        // Upload failed — store truncated inline as last resort
        data.raw_content = rawContent.slice(0, 10_000);
      }
    }

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

    // Load messages — if stored as URL (large payload), fetch the file
    let messages = [];
    if (record.messages_json_url) {
      try {
        const res = await fetch(record.messages_json_url);
        messages = await res.json();
      } catch {
        messages = record.messages_json ? JSON.parse(record.messages_json) : [];
      }
    } else {
      messages = record.messages_json ? JSON.parse(record.messages_json) : [];
    }

    // Primary: raw_content_url (large content stored as file). Fallback: raw_content field.
    let rawContent = null;
    let rawContentUrl = null;

    if (record.raw_content_url) {
      rawContentUrl = record.raw_content_url;
      try {
        const res = await fetch(record.raw_content_url);
        rawContent = await res.text();
      } catch {}
    }

    // If no URL or fetch failed, use inline raw_content (only valid if it's not a truncated stub)
    if (!rawContent && record.raw_content && record.raw_content.length > 500) {
      rawContent = record.raw_content;
    }

    // Last resort: look in messages array
    if (!rawContent && messages.length > 0) {
      const lastWithCode = [...messages].reverse().find(m => m.role === 'assistant' && m.rawContent);
      if (lastWithCode) rawContent = lastWithCode.rawContent;
    }

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