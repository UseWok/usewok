// Active domain store — persisted in localStorage, shared across the app
const KEY = 'stensor_active_domain';
const listeners = new Set();

export function getActiveDomain() {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}

export function setActiveDomain(domain) {
  // domain = { url, name } or null
  try {
    if (domain) localStorage.setItem(KEY, JSON.stringify(domain));
    else localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach(fn => fn(domain));
}

export function onActiveDomainChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Domains list
const LIST_KEY = 'stensor_domains_list';

export function getDomainsList() {
  try { return JSON.parse(localStorage.getItem(LIST_KEY) || '[]'); } catch { return []; }
}

export function saveDomainsList(list) {
  try { localStorage.setItem(LIST_KEY, JSON.stringify(list)); } catch {}
}