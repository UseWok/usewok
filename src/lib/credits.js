const USED_KEY = 'stensor_credits_used';
const LIMIT_KEY = 'stensor_credits_limit';
const DEFAULT_LIMIT = 25;

export function getCreditsUsed() {
  return parseInt(localStorage.getItem(USED_KEY) || '0', 10);
}

export function getCreditsLimit() {
  return parseInt(localStorage.getItem(LIMIT_KEY) || String(DEFAULT_LIMIT), 10);
}

export function setCreditsLimit(limit) {
  localStorage.setItem(LIMIT_KEY, String(limit));
}

export function addCredit() {
  const c = getCreditsUsed() + 1;
  localStorage.setItem(USED_KEY, String(c));
  return c;
}

export function resetCredits(newLimit) {
  localStorage.setItem(USED_KEY, '0');
  if (newLimit !== undefined) localStorage.setItem(LIMIT_KEY, String(newLimit));
}

export function isBlocked(isAdmin) {
  if (isAdmin) return false;
  return getCreditsUsed() >= getCreditsLimit();
}