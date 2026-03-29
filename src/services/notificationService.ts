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

export function sendNotification({ title, description, type = "info" }: SendNotificationParams) {
  if (!isAnalysisAlertsEnabled()) return;
  // Just trigger a refetch from the API - the backend creates the notification
  window.dispatchEvent(new Event("notifications-updated"));
}
