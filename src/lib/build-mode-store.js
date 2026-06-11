/**
 * lib/build-mode-store.js
 * Global build mode store — persisted to cloud + localStorage.
 * Ensures Home → ChatPage synchronization (no desync).
 */

import { base44 } from '@/api/base44Client';

const LS_KEY = 'wok_build_mode';

let _listeners = [];
// Valid modes: 'Automatic' | 'Flash' | 'Max'
// 'Automatic' = server-side 80% Flash / 20% Max probability routing
const _stored = localStorage.getItem(LS_KEY);
let _current = _stored && ['Automatic', 'Flash', 'Max'].includes(_stored) ? _stored : 'Automatic';

export function getBuildMode() {
  return _current;
}

export function subscribeBuildMode(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function _notify() {
  _listeners.forEach(fn => fn(_current));
}

export async function setBuildMode(mode) {
  _current = mode;
  localStorage.setItem(LS_KEY, mode);
  _notify();
  // Persist to cloud
  try {
    await base44.auth.updateMe({ build_mode: mode });
  } catch {}
}

// Call on app init to hydrate from cloud
export async function hydrateBuildModeFromCloud() {
  try {
    const u = await base44.auth.me();
    if (u?.build_mode && u.build_mode !== _current) {
      _current = u.build_mode;
      localStorage.setItem(LS_KEY, u.build_mode);
      _notify();
    }
  } catch {}
}