import { base44 } from '@/api/base44Client';

// In-memory cache for profile data — avoids re-fetching the same JSON
// blob URL on every page visit. Keyed by brand_keywords value (URL or raw JSON).
const _profileDataCache = new Map();

export async function getProfileData(profile) {
  if (!profile) return {};
  if (!profile.brand_keywords) return {};

  const key = profile.brand_keywords;
  if (_profileDataCache.has(key)) return _profileDataCache.get(key);

  let result;
  if (key.startsWith('http')) {
    try {
      const res = await fetch(key);
      result = await res.json();
    } catch {
      result = {};
    }
  } else {
    try {
      result = JSON.parse(key);
    } catch {
      result = {};
    }
  }

  // ── Demo mode: load full data from localStorage ──
  if (result && result._demo && result._ls_key) {
    try {
      const ls = localStorage.getItem(result._ls_key);
      if (ls) {
        const full = JSON.parse(ls);
        _profileDataCache.set(key, full);
        return full;
      }
    } catch {
      // fall through to cached result
    }
  }

  _profileDataCache.set(key, result);
  return result;
}

export async function uploadProfileData(data) {
  const jsonStr = JSON.stringify(data);
  try {
    const fileObj = new File([jsonStr], "profile_data.json", { type: "application/json" });
    const uploadRes = await base44.integrations.Core.UploadFile({ file: fileObj });
    if (uploadRes && uploadRes.file_url) {
      return uploadRes.file_url;
    }
  } catch (err) {
    console.error("Upload fallback", err);
  }
  return jsonStr;
}