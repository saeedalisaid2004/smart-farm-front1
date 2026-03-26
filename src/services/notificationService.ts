type NotificationType = "success" | "warning" | "error" | "info";

interface SendNotificationParams {
  title: string;
  description?: string;
  type?: NotificationType;
}

const STORAGE_KEY = "app_notifications";

export function sendNotification({ title, description, type = "info" }: SendNotificationParams) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const notifications = stored ? JSON.parse(stored) : [];
    const newNotification = {
      id: crypto.randomUUID(),
      title,
      description: description || null,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    // Keep max 100
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 100)));
    window.dispatchEvent(new Event("notifications-updated"));
  } catch {}
}
