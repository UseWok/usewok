// Isolated localStorage helpers for chat persistence

export const getLocalDiscussions = (workspaceId) => {
  try {
    const raw = localStorage.getItem(`wok_discussions_${workspaceId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalDiscussions = (workspaceId, data) => {
  try {
    localStorage.setItem(`wok_discussions_${workspaceId}`, JSON.stringify(data));
  } catch (err) {
    console.error('saveLocalDiscussions failed:', err);
  }
};

export const getConversationMessages = (conversationId) => {
  try {
    const raw = localStorage.getItem(`wok_messages_${conversationId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveConversationMessages = (conversationId, messages) => {
  try {
    localStorage.setItem(`wok_messages_${conversationId}`, JSON.stringify(messages));
  } catch (err) {
    console.error('saveConversationMessages failed:', err);
  }
};