/**
 * Removes legacy shared localStorage keys that were not user-scoped.
 * Run once on app startup.
 */
const LEGACY_SHARED_KEYS = [
  "dashboard_settings",
  "admin_settings",
  "analysis_stats",
  "analysis_daily",
  "smart_farm_notifications",
  "settingOverrides",
  "avatar_cache",
];

export function cleanupSharedLocalStorage() {
  try {
    for (const key of LEGACY_SHARED_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // Silent fail
  }
}
