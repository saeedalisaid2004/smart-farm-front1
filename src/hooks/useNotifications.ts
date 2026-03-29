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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const userId = getExternalUserId();
    setLoading(true);
    try {
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
      setNotifications(apiList);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for new analysis notifications to refetch from API
  useEffect(() => {
    const handler = () => {
      setTimeout(() => fetchNotifications(), 500);
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
    try {
      await markNotificationAsRead(id);
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    for (const n of notifications.filter((n) => !n.is_read)) {
      try { await markNotificationAsRead(n.id); } catch {}
    }
  }, [notifications]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
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
