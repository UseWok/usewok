import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});

// --- AGGRESSIVE CACHE IMPLEMENTATION ---

const CACHE_EXPIRATION_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Generates a SHA-256 hash for a given string.
 */
async function hashString(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Wrapper to cache AI requests aggressively.
 * @param {string|object} prompt - The user prompt/query payload to hash.
 * @param {Function} fetchFunction - The actual base44 API call returning a Promise.
 * @returns {Promise<any>} - The cached or fresh response.
 */
export const cachedAIRequest = async (prompt, fetchFunction) => {
  const hash = await hashString(JSON.stringify(prompt));
  const cacheKey = `wok_ai_cache_${hash}`;

  const cachedStr = localStorage.getItem(cacheKey);
  if (cachedStr) {
    try {
      const cached = JSON.parse(cachedStr);
      if (Date.now() - cached.timestamp < CACHE_EXPIRATION_MS) {
        console.log("Serving from cache:", cacheKey);
        return cached.data;
      }
    } catch (e) {
      localStorage.removeItem(cacheKey); // Clear corrupted cache
    }
  }

  // Execute actual API call if no valid cache exists
  const response = await fetchFunction();

  // Save to cache
  localStorage.setItem(cacheKey, JSON.stringify({
    timestamp: Date.now(),
    data: response
  }));

  return response;
};