// User-scoped discussion storage

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