// Active domain store — in-memory + cloud-persisted on User entity
import { base44 } from '@/api/base44Client';

let _activeDomain = null;
let _initialized = false;
const listeners = new Set();

/** Initialize from cloud (call after auth). Safe to call multiple times. */
export async function initActiveDomainFromUser() {
  if (_initialized) return;
  _initialized = true;
  try {
    const user = await base44.auth.me();
    if (user?.active_domain_url) {
      _activeDomain = { url: user.active_domain_url, name: user.active_domain_name || '' };
      listeners.forEach(fn => fn(_activeDomain));
    }
  } catch {}
}

export function getActiveDomain() {
  return _activeDomain;
}

export async function setActiveDomain(domain) {
  _activeDomain = domain;
  listeners.forEach(fn => fn(domain));
  try {
    await base44.auth.updateMe({
      active_domain_url: domain?.url || '',
      active_domain_name: domain?.name || '',
    });
  } catch {}
}

export function onActiveDomainChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Domains list — now derived from BusinessProfile cloud entity, no localStorage
export function getDomainsList() {
  return []; // Deprecated — use base44.entities.BusinessProfile.filter() directly
}

export function saveDomainsList() {
  // Deprecated — domains are stored as BusinessProfile records in cloud
}