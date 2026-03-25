import { supabase } from "@/integrations/supabase/client";

type NotificationType = "success" | "warning" | "error" | "info";

interface SendNotificationParams {
  title: string;
  description?: string;
  type?: NotificationType;
}

function getUserId(): string | null {
  try {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return String(parsed.id || parsed.email || "");
    }
  } catch {}
  return null;
}

export async function sendNotification({ title, description, type = "info" }: SendNotificationParams) {
  const user_id = getUserId();
  if (!user_id) return;

  try {
    await supabase.functions.invoke("manage-notifications", {
      body: { action: "create", user_id, title, description, type },
    });
    window.dispatchEvent(new Event("notifications-updated"));
  } catch {
    // Silent fail
  }
}
