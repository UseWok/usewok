import { base44 } from '@/api/base44Client';

export async function getProfileData(profile) {
  if (!profile) return {};
  // Demo mode — data already on the object itself
  if (profile._demo) return profile;
  // Also check localStorage cache (demo mode sets this)
  try {
    const cached = localStorage.getItem(`profile_data_${profile.site_url}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed._demo) return parsed;
    }
  } catch {}
  if (!profile.brand_keywords) return {};
  if (profile.brand_keywords.startsWith('http')) {
    try {
      const res = await fetch(profile.brand_keywords);
      return await res.json();
    } catch {
      return {};
    }
  }
  try {
    return JSON.parse(profile.brand_keywords);
  } catch {
    return {};
  }
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
  return jsonStr; // Fallback to string if upload fails
}