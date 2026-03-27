import { supabase } from "@/integrations/supabase/client";

interface NotifSettings {
  push: boolean;
  email: boolean;
  analysis_alerts: boolean;
}

const defaultSettings: NotifSettings = { push: true, email: true, analysis_alerts: true };

export async function getNotificationSettings(userId: number | string, role: "farmer" | "admin"): Promise<NotifSettings> {
  const { data, error } = await supabase.functions.invoke("notification-settings", {
    body: { action: "get", user_id: String(userId), role },
  });
  if (error) throw error;
  return data?.current_settings || defaultSettings;
}

export async function updateNotificationSettings(
  userId: number | string,
  role: "farmer" | "admin",
  settings: Partial<NotifSettings>
): Promise<NotifSettings> {
  // Update in our database
  const { data, error } = await supabase.functions.invoke("notification-settings", {
    body: { action: "update", user_id: String(userId), role, settings },
  });
  if (error) throw error;

  // Also sync with external API (fire-and-forget)
  try {
    const API_BASE = "https://mahmoud123mahmoud-smartfarm-api.hf.space";
    const endpoint = role === "admin" ? "admin-settings" : "farmer-settings";
    fetch(`${API_BASE}/notifications/notifications/${endpoint}/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
  } catch {}

  return data?.current_settings || { ...defaultSettings, ...settings };
}
