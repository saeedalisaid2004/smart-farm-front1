import { supabase } from "@/integrations/supabase/client";
import { getExternalUserId } from "@/services/smartFarmApi";

type NotificationType = "success" | "warning" | "error" | "info";

interface SendNotificationParams {
  title: string;
  description?: string;
  type?: NotificationType;
}

export function isAnalysisAlertsEnabled(): boolean {
  try {
    return localStorage.getItem("analysis_alerts_enabled") !== "false";
  } catch {
    return true;
  }
}

export function setAnalysisAlertsEnabled(enabled: boolean) {
  localStorage.setItem("analysis_alerts_enabled", enabled ? "true" : "false");
}

export async function sendNotification({ title, description, type = "info" }: SendNotificationParams) {
  if (!isAnalysisAlertsEnabled()) return;
  const userId = getExternalUserId();
  if (!userId) return;
  try {
    await supabase.functions.invoke("manage-notifications", {
      body: { action: "create", user_id: String(userId), title, description, type },
    });
  } catch {}
  window.dispatchEvent(new Event("notifications-updated"));
}
