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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const userId = getExternalUserId();

    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getUserNotifications(userId);
      if (Array.isArray(data)) {
        const mapped: Notification[] = data.map((n: any) => ({
          id: String(n.id ?? n.notification_id ?? crypto.randomUUID()),
          title: n.title ?? n.message ?? "Notification",
          description: n.description ?? n.body ?? null,
          type: n.type ?? "info",
          is_read: n.is_read ?? false,
          created_at: n.created_at ?? n.date ?? new Date().toISOString(),
        }));
        setNotifications(mapped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch {
      // API unavailable
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const handler = () => fetchNotifications();
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
  };
}
