// Simple event system for real-time credit updates across components
const CREDITS_EVENT = 'stensor_credits_update';

export function emitCreditsUpdate(creditsUsed) {
  window.dispatchEvent(new CustomEvent(CREDITS_EVENT, { detail: { credits_used: creditsUsed } }));
}

export function onCreditsUpdate(callback) {
  const handler = (e) => callback(e.detail);
  window.addEventListener(CREDITS_EVENT, handler);
  return () => window.removeEventListener(CREDITS_EVENT, handler);
}