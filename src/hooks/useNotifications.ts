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

export function useNotifications() {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);

  const checkPushSetting = useCallback(async (userId: number) => {
    try {
      const data = await getNotificationSettings(userId);
      const s = data?.settings || data;
      return s?.push !== false;
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
  }, [fetchNotifications]);

  useEffect(() => {
    const handler = () => {
      setTimeout(() => fetchNotifications(), 500);
    };
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
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
