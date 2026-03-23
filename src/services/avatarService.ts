import { apiSaveSettings, apiGetProfileImage, getExternalUserId } from "./smartFarmApi";

const AVATAR_CACHE_KEY = "avatar_cache";

function resolveUserId(userId?: string | number | null): string {
  if (userId !== undefined && userId !== null && String(userId).trim()) {
    return String(userId);
  }
  try {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return String(parsed.id || parsed.email || "default");
    }
  } catch {}
  return "default";
}

function getCacheKey(userId?: string | number | null): string {
  return `${AVATAR_CACHE_KEY}_${resolveUserId(userId)}`;
}

export async function uploadAvatar(userId: string | number, file: File): Promise<string> {
  const numericId = getExternalUserId() || Number(userId);

  // Upload to API
  try {
    await apiSaveSettings(numericId, { profile_img: file });
  } catch (err) {
    console.error("Failed to upload avatar to API:", err);
  }

  // Build the profile image URL and cache it
  const url = apiGetProfileImage(numericId);
  const timestampedUrl = `${url}?t=${Date.now()}`;

  try {
    localStorage.setItem(getCacheKey(userId), timestampedUrl);
  } catch {}

  return timestampedUrl;
}

export function getSavedAvatarUrl(userId?: string | number | null): string | null {
  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(getCacheKey(userId));
    if (cached) return cached;
  } catch {}

  // Build URL from API if we have a numeric user id
  const numId = getExternalUserId() || (userId ? Number(userId) : null);
  if (numId && !isNaN(numId)) {
    const url = apiGetProfileImage(numId);
    return url;
  }

  return null;
}

export function removeAvatar(userId?: string | number | null): void {
  try {
    localStorage.removeItem(getCacheKey(userId));
  } catch {}
}
