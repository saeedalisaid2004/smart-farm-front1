import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
  user_id?: string;
}

function getUserId(): string | null {
  try {
    const stored = localStorage.getItem("app_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return String(parsed.id || parsed.email || "");
    }
  } catch {}
  return null;
}

async function callNotificationApi(action: string, extra: Record<string, unknown> = {}) {
  const user_id = getUserId();
  if (!user_id) return null;

  const { data, error } = await supabase.functions.invoke("manage-notifications", {
    body: { action, user_id, ...extra },
  });

  if (error) {
    console.error("Notification API error:", error);
    return null;
  }
  return data;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const data = await callNotificationApi("list");
    if (Array.isArray(data)) setNotifications(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();

    const handler = () => fetchNotifications();
    window.addEventListener("notifications-updated", handler);

    // Realtime subscription
    const userId = getUserId();
    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const row = payload.new as Notification;
          if (row.user_id === userId) {
            setNotifications((prev) => [row, ...prev].slice(0, 100));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const row = payload.new as Notification;
          if (row.user_id === userId) {
            setNotifications((prev) => prev.map((n) => (n.id === row.id ? row : n)));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "notifications" },
        (payload) => {
          const oldRow = payload.old as { id: string };
          setNotifications((prev) => prev.filter((n) => n.id !== oldRow.id));
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("notifications-updated", handler);
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await callNotificationApi("mark_read", { notification_id: id });
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await callNotificationApi("mark_all_read");
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await callNotificationApi("delete", { notification_id: id });
  };

  const clearAll = async () => {
    setNotifications([]);
    await callNotificationApi("clear_all");
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
