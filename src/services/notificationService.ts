type NotificationType = "success" | "warning" | "error" | "info";

interface SendNotificationParams {
  title: string;
  description?: string;
  type?: NotificationType;
}

const STORAGE_KEY = "smart_farm_notifications";

export function sendNotification({ title, description, type = "info" }: SendNotificationParams) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const notifications = raw ? JSON.parse(raw) : [];
    
    notifications.unshift({
      id: crypto.randomUUID(),
      title,
      description: description || null,
      type,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // Keep max 100 notifications
    if (notifications.length > 100) notifications.length = 100;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event("notifications-updated"));
  } catch {
    // Silent fail
  }
}
