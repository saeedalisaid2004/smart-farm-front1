import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as apiDeleteNotification,
  deleteAllNotifications,
  getExternalUserId,
  getNotificationSettings,
} from "@/services/smartFarmApi";
import { useLanguage } from "@/contexts/LanguageContext";
import { containsArabic, containsLatin, stripArabic, stripEnglish } from "@/lib/textLang";

const localizeText = (text: string | null | undefined, lang: "en" | "ar"): string => {
  if (!text) return text ?? "";
  if (typeof text !== "string") return String(text);
  if (lang === "ar") {
    if (containsArabic(text) && containsLatin(text)) return stripEnglish(text) || text;
    return text;
  }
  // en: strip arabic if mixed
  if (containsArabic(text) && containsLatin(text)) return stripArabic(text) || text;
  return text;
};

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

type Role = "admin" | "farmer";

const matchesRole = (n: any, role: Role): boolean => {
  // Explicit role field wins
  const explicit = (n.role || n.scope || n.audience || "").toString().toLowerCase();
  if (explicit === "admin" || explicit === "farmer") return explicit === role;

  // Otherwise infer from `type` prefix: admin_* / farmer_*
  const type = (n.type || "").toString().toLowerCase();
  if (type.startsWith("admin_") || type.startsWith("admin-")) return role === "admin";
  if (type.startsWith("farmer_") || type.startsWith("farmer-")) return role === "farmer";

  // Title prefix fallback: [admin] / [farmer]
  const title = (n.title || "").toString().toLowerCase();
  if (title.startsWith("[admin]")) return role === "admin";
  if (title.startsWith("[farmer]")) return role === "farmer";

  // Untagged notifications default to farmer (legacy)
  return role === "farmer";
};

const stripRolePrefix = (text: string | null | undefined): string => {
  if (!text) return text ?? "";
  return text.replace(/^\s*\[(admin|farmer)\]\s*/i, "");
};

export function useNotifications(role: Role = "farmer") {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);

  const checkPushSetting = useCallback(async (userId: number) => {
    try {
      const data = await getNotificationSettings(userId);
      const s = data?.settings || data;
      // Role-specific push key with fallback to generic `push`
      const key = role === "admin" ? "push_notifications_admin" : "push_notifications_farmer";
      const altKey = role === "admin" ? "admin_push" : "farmer_push";
      const val = s?.[key] ?? s?.[altKey] ?? s?.push;
      return val !== false;
    } catch {
      return true;
    }
  }, [role]);

  const fetchNotifications = useCallback(async () => {
    const userId = getExternalUserId();
    setLoading(true);
    try {
      if (!userId) {
        setNotifications([]);
        return;
      }

      const isEnabled = await checkPushSetting(userId);
      setPushEnabled(isEnabled);

      if (!isEnabled) {
        setNotifications([]);
        return;
      }

      const data = await getUserNotifications(userId);
      const raw = Array.isArray(data) ? data : data?.notifications || data?.data || [];
      const list: Notification[] = raw.map((n: any) => ({
        id: String(n.id ?? n.notif_id ?? crypto.randomUUID()),
        title: n.title ?? "Notification",
        description: n.description ?? n.message ?? null,
        type: n.type ?? "info",
        is_read: n.is_read ?? n.read ?? false,
        created_at: n.created_at ?? n.date ?? new Date().toISOString(),
      }));

      setNotifications(list);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [checkPushSetting]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = () => {
      fetchNotifications();
    };
    const visibilityHandler = () => {
      if (document.visibilityState === "visible") fetchNotifications();
    };
    window.addEventListener("notifications-updated", handler);
    window.addEventListener("focus", handler);
    document.addEventListener("visibilitychange", visibilityHandler);
    return () => {
      window.removeEventListener("notifications-updated", handler);
      window.removeEventListener("focus", handler);
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }, [fetchNotifications]);

  const sorted = useMemo(() => {
    return [...notifications]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((n) => ({
        ...n,
        title: localizeText(n.title, language),
        description: localizeText(n.description, language),
      }));
  }, [notifications, language]);

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
    const userId = getExternalUserId();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (userId) {
      try {
        await markAllNotificationsAsRead(userId);
      } catch {}
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiDeleteNotification(id);
    } catch {}
  }, []);

  const clearAll = useCallback(async () => {
    const userId = getExternalUserId();
    setNotifications([]);
    if (userId) {
      try {
        await deleteAllNotifications(userId);
      } catch {}
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
