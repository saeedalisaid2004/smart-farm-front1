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
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getUserNotifications(userId);
      const list = Array.isArray(data) ? data : data?.notifications || data?.data || [];
      setNotifications(
        list.map((n: any) => ({
          id: String(n.id ?? n.notif_id ?? crypto.randomUUID()),
          title: n.title ?? "Notification",
          description: n.description ?? n.message ?? null,
          type: n.type ?? "info",
          is_read: n.is_read ?? n.read ?? false,
          created_at: n.created_at ?? n.date ?? new Date().toISOString(),
        }))
      );
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
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
    } catch {
      // Optimistic update stays
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const unread = sorted.filter((n) => !n.is_read);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    for (const n of unread) {
      try {
        await markNotificationAsRead(n.id);
      } catch {
        // continue
      }
    }
  }, [sorted]);

  const deleteNotification = useCallback((_id: string) => {
    // No delete endpoint available - hide locally
    setNotifications((prev) => prev.filter((n) => n.id !== _id));
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
