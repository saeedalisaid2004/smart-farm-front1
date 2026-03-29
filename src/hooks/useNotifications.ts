import { useState, useEffect, useCallback } from "react";
import { getUserNotifications, markNotificationAsRead, getExternalUserId } from "@/services/smartFarmApi";

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

const LOCAL_STORAGE_KEY = "app_notifications";

function getLocalNotifications(): Notification[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const userId = getExternalUserId();
    setLoading(true);
    try {
      // Fetch from API
      let apiList: Notification[] = [];
      if (userId) {
        const data = await getUserNotifications(userId);
        const raw = Array.isArray(data) ? data : data?.notifications || data?.data || [];
        apiList = raw.map((n: any) => ({
          id: String(n.id ?? n.notif_id ?? crypto.randomUUID()),
          title: n.title ?? "Notification",
          description: n.description ?? n.message ?? null,
          type: n.type ?? "info",
          is_read: n.is_read ?? n.read ?? false,
          created_at: n.created_at ?? n.date ?? new Date().toISOString(),
        }));
      }

      // Merge with local notifications
      const localList = getLocalNotifications();

      // Combine: API first, then local (deduplicate by id)
      const idSet = new Set(apiList.map((n) => n.id));
      const merged = [...apiList, ...localList.filter((n) => !idSet.has(n.id))];

      setNotifications(merged);
    } catch {
      // Fallback to local only
      setNotifications(getLocalNotifications());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for local notification updates
  useEffect(() => {
    const handler = () => {
      // Defer to avoid React state update conflicts
      setTimeout(() => fetchNotifications(), 50);
    };
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
  }, [fetchNotifications]);

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const unreadCount = sorted.filter((n) => !n.is_read).length;

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    // Update localStorage too
    try {
      const local = getLocalNotifications();
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(local.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
      );
    } catch {}
    try {
      await markNotificationAsRead(id);
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      const local = getLocalNotifications();
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(local.map((n) => ({ ...n, is_read: true })))
      );
    } catch {}
    for (const n of sorted.filter((n) => !n.is_read)) {
      try { await markNotificationAsRead(n.id); } catch {}
    }
  }, [sorted]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const local = getLocalNotifications();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local.filter((n) => n.id !== id)));
    } catch {}
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    try { localStorage.setItem(LOCAL_STORAGE_KEY, "[]"); } catch {}
  }, []);

  return {
    notifications: sorted,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
