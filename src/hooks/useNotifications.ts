import { useState, useEffect, useCallback } from "react";
import { getUserNotifications, getExternalUserId } from "@/services/smartFarmApi";

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

const LOCAL_STORAGE_KEY = "app_notifications";
const READ_IDS_KEY = "notifications_read_ids";
const DELETED_IDS_KEY = "notifications_deleted_ids";

function getReadIds(): Set<string> {
  try {
    const stored = localStorage.getItem(READ_IDS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch { return new Set(); }
}

function saveReadIds(ids: Set<string>) {
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
}

function getDeletedIds(): Set<string> {
  try {
    const stored = localStorage.getItem(DELETED_IDS_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch { return new Set(); }
}

function saveDeletedIds(ids: Set<string>) {
  localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...ids]));
}

function loadLocalNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

function saveLocalNotifications(notifications: Notification[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications));
  } catch {}
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const userId = getExternalUserId();
    const localNotifs = loadLocalNotifications();
    const readIds = getReadIds();
    const deletedIds = getDeletedIds();

    let apiNotifs: Notification[] = [];

    if (userId) {
      try {
        const data = await getUserNotifications(userId);
        if (Array.isArray(data)) {
          apiNotifs = data.map((n: any) => ({
            id: String(n.id ?? n.notification_id ?? crypto.randomUUID()),
            title: n.title ?? n.message ?? "Notification",
            description: n.description ?? n.body ?? null,
            type: n.type ?? "info",
            is_read: readIds.has(String(n.id ?? n.notification_id)) ? true : (n.is_read ?? false),
            created_at: n.created_at ?? n.date ?? new Date().toISOString(),
          }));
        }
      } catch {
        // API unavailable, fall back to local only
      }
    }

    // Merge: API notifications + local-only notifications (deduplicate by id)
    const apiIds = new Set(apiNotifs.map((n) => n.id));
    const merged = [
      ...apiNotifs,
      ...localNotifs.filter((n) => !apiIds.has(n.id)),
    ]
      .filter((n) => !deletedIds.has(n.id))
      .map((n) => ({ ...n, is_read: readIds.has(n.id) ? true : n.is_read }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setNotifications(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const handler = () => fetchNotifications();
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: string) => {
    const readIds = getReadIds();
    readIds.add(id);
    saveReadIds(readIds);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    // Also update local storage
    const local = loadLocalNotifications();
    saveLocalNotifications(local.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllAsRead = () => {
    const readIds = getReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const local = loadLocalNotifications();
    saveLocalNotifications(local.map((n) => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id: string) => {
    const deletedIds = getDeletedIds();
    deletedIds.add(id);
    saveDeletedIds(deletedIds);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    const local = loadLocalNotifications();
    saveLocalNotifications(local.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    const deletedIds = getDeletedIds();
    notifications.forEach((n) => deletedIds.add(n.id));
    saveDeletedIds(deletedIds);
    setNotifications([]);
    saveLocalNotifications([]);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refetch: fetchNotifications,
  };
}
