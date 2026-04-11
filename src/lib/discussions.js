// User-scoped discussion storage
import { base44 } from '@/api/base44Client';

export const getDiscussionsKey = () => {
  const uid = localStorage.getItem('stensor_uid') || 'default';
  return `discussions_${uid}`;
};

export const getMessagesKey = () => {
  const uid = localStorage.getItem('stensor_uid') || 'default';
  return `discussion_messages_${uid}`;
};

export const setCurrentUser = (userId) => {
  localStorage.setItem('stensor_uid', userId);
};

export const getDiscussions = () => {
  try { return JSON.parse(localStorage.getItem(getDiscussionsKey()) || '[]'); }
  catch { return []; }
};

export const saveDiscussions = (discussions) => {
  localStorage.setItem(getDiscussionsKey(), JSON.stringify(discussions.slice(0, 50)));
};

export const getConversationMessages = (convId) => {
  try { return JSON.parse(localStorage.getItem(getMessagesKey()) || '{}')[convId] || []; }
  catch { return []; }
};

export const saveConversationMessages = (convId, msgs) => {
  try {
    const all = JSON.parse(localStorage.getItem(getMessagesKey()) || '{}');
    all[convId] = msgs;
    localStorage.setItem(getMessagesKey(), JSON.stringify(all));
  } catch {}
};

// Cloud sync — saves full conversation to DB for cross-device access
export async function syncConversationToCloud(convId, messages, meta = {}) {
  try {
    const results = await base44.entities.Conversation.filter({ conv_id: convId });
    const data = { conv_id: convId, messages_json: JSON.stringify(messages), ...meta };
    if (results.length > 0) {
      await base44.entities.Conversation.update(results[0].id, data);
    } else {
      await base44.entities.Conversation.create(data);
    }
  } catch {}
}

// Load messages from cloud — secured by user ownership
export async function loadConversationFromCloud(convId) {
  try {
    const me = await base44.auth.me();
    if (!me?.email) return null;
    const results = await base44.entities.Conversation.filter({ conv_id: convId, created_by: me.email });
    if (results.length > 0 && results[0].messages_json) {
      return JSON.parse(results[0].messages_json);
    }
  } catch {}
  return null;
}

// Load all cloud discussions for sidebar — filtered to current user
export async function loadDiscussionsFromCloud() {
  try {
    const me = await base44.auth.me();
    if (!me?.email) return [];
    return await base44.entities.Conversation.filter({ created_by: me.email }, '-updated_date', 50);
  } catch { return []; }
}