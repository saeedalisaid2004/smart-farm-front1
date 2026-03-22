type NotificationType = "success" | "warning" | "error" | "info";

interface SendNotificationParams {
  title: string;
  description?: string;
  type?: NotificationType;
}

const STORAGE_KEY = "smart_farm_notifications";

function getUserId(): string {
  try {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return String(parsed.id || parsed.email || "default");
    }
  } catch {}
  return "default";
}

function userKey(): string {
  return `${STORAGE_KEY}_${getUserId()}`;
}

export function sendNotification({ title, description, type = "info" }: SendNotificationParams) {
  try {
    const raw = localStorage.getItem(userKey());
    const notifications = raw ? JSON.parse(raw) : [];
    
    notifications.unshift({
      id: crypto.randomUUID(),
      title,
      description: description || null,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (notifications.length > 100) notifications.length = 100;

    localStorage.setItem(userKey(), JSON.stringify(notifications));
    window.dispatchEvent(new Event("notifications-updated"));
  } catch {
    // Silent fail
  }
}
