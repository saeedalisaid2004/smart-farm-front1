import { useState, useEffect, useCallback } from "react";
import { getUserNotifications, markNotificationAsRead, getExternalUserId } from "@/services/smartFarmApi";
import { supabase } from "@/integrations/supabase/client";

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
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);

  // Check push setting from notification_settings table
  const checkPushSetting = useCallback(async (userId: number) => {
    try {
      const { data } = await supabase
        .from("notification_settings")
        .select("push")
        .eq("external_user_id", String(userId))
        .maybeSingle();
      // If no settings row exists, default to enabled
      return data?.push !== false;
    } catch {
      return true;
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const userId = getExternalUserId();
    setLoading(true);
    try {
      if (!userId) {
        setNotifications([]);
        return;
      }

      // Check if push notifications are enabled
      const isEnabled = await checkPushSetting(userId);
      setPushEnabled(isEnabled);

      if (!isEnabled) {
        setNotifications([]);
        return;
      }

      let apiList: Notification[] = [];
      let supaList: Notification[] = [];

      // Fetch from external API
      try {
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
      } catch {}

      // Fetch from Supabase (analysis notifications)
      try {
        const { data } = await supabase.functions.invoke("manage-notifications", {
          body: { action: "list", user_id: String(userId) },
        });
        const raw = Array.isArray(data) ? data : [];
        supaList = raw.map((n: any) => ({
          id: `supa-${n.id}`,
          title: n.title ?? "Notification",
          description: n.description ?? null,
          type: n.type ?? "info",
          is_read: n.is_read ?? false,
          created_at: n.created_at ?? new Date().toISOString(),
        }));
      } catch {}

      setNotifications([...apiList, ...supaList]);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [checkPushSetting]);

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
      if (id.startsWith("supa-")) {
        const userId = getExternalUserId();
        await supabase.functions.invoke("manage-notifications", {
          body: { action: "mark_read", user_id: String(userId), notification_id: id.replace("supa-", "") },
        });
      } else {
        await markNotificationAsRead(id);
      }
    } catch {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const userId = getExternalUserId();
    // Mark external API notifications
    for (const n of notifications.filter((n) => !n.is_read && !n.id.startsWith("supa-"))) {
      try { await markNotificationAsRead(n.id); } catch {}
    }
    // Mark Supabase notifications
    if (userId) {
      try {
        await supabase.functions.invoke("manage-notifications", {
          body: { action: "mark_all_read", user_id: String(userId) },
        });
      } catch {}
    }
  }, [notifications]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (id.startsWith("supa-")) {
      const userId = getExternalUserId();
      supabase.functions.invoke("manage-notifications", {
        body: { action: "delete", user_id: String(userId), notification_id: id.replace("supa-", "") },
      }).catch(() => {});
    }
  }, []);

  const clearAll = useCallback(() => {
    const userId = getExternalUserId();
    setNotifications([]);
    if (userId) {
      supabase.functions.invoke("manage-notifications", {
        body: { action: "clear_all", user_id: String(userId) },
      }).catch(() => {});
    }
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
