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
  if (containsArabic(text) && containsLatin(text)) return stripArabic(text) || text;
  return text;
};

// ============ Admin notification translation ============
const SERVICE_MAP: Record<string, { en: string; ar: string }> = {
  plant: { en: "Plant Disease Detection", ar: "تشخيص أمراض النبات" },
  animal: { en: "Animal Weight Estimation", ar: "تقدير وزن الحيوان" },
  crop: { en: "Crop Recommendation", ar: "توصية المحاصيل" },
  soil: { en: "Soil Analysis", ar: "تحليل التربة" },
  fruit: { en: "Fruit Quality Analysis", ar: "تحليل جودة الفاكهة" },
  chat: { en: "Smart Farm Chatbot", ar: "روبوت الدردشة" },
};

const findService = (text: string): { en: string; ar: string } | null => {
  const lower = text.toLowerCase();
  for (const key of Object.keys(SERVICE_MAP)) {
    if (lower.includes(key)) return SERVICE_MAP[key];
  }
  return null;
};

const STATUS_WORDS = {
  enabled: { en: "enabled", ar: "تم التفعيل" },
  disabled: { en: "disabled", ar: "تم الإيقاف" },
  online: { en: "online", ar: "يعمل الآن" },
  offline: { en: "offline", ar: "متوقفة الآن" },
  active: { en: "active", ar: "نشطة" },
  inactive: { en: "inactive", ar: "غير نشطة" },
};

const translateAdminText = (text: string | null | undefined, lang: "en" | "ar"): string => {
  if (!text) return text ?? "";
  const original = String(text).trim();
  let out = original;

  // ===== Specific API patterns =====
  if (lang === "en") {
    // Title: "تنبيه الخدمات 🚜" → "Services Alert 🚜"
    out = out.replace(/تنبيه\s*الخدمات/g, "Services Alert");

    // Title: "تحديث نظام: <ModelName>" → "System update: <ModelName>"
    out = out.replace(/^تحديث\s*نظام\s*:?\s*/i, "System update: ");

    // "تم تشغيل ✅ خدمة (X) بنجاح." → "Service (X) has been enabled ✅ successfully."
    out = out.replace(
      /تم\s*تشغيل\s*✅?\s*خدمة\s*(\([^)]+\)|\S+)\s*بنجاح\.?/g,
      "Service $1 has been enabled ✅ successfully."
    );

    // "تم إيقاف ❌ خدمة (X) بنجاح." → "Service (X) has been disabled ❌ successfully."
    out = out.replace(
      /تم\s*إيقاف\s*❌?\s*خدمة\s*(\([^)]+\)|\S+)\s*بنجاح\.?/g,
      "Service $1 has been disabled ❌ successfully."
    );

    // Maintenance / back-online patterns
    out = out.replace(
      /نحيطكم\s*علماً\s*بأن\s*خدمة\s*(.+?)\s*متوقفة\s*حالياً\s*للصيانة/i,
      "Service $1 is currently down for maintenance"
    );
    out = out.replace(
      /نحيطكم\s*علماً\s*بأن\s*خدمة\s*(.+?)\s*عادت\s*للعمل\s*الآن/i,
      "Service $1 is back online"
    );

    // If a specific pattern matched, return early to keep model names intact
    if (out !== original) return out.replace(/\s+/g, " ").trim();

    // Generic standalone phrases (fallback only when no specific match)
    out = out.replace(/متوقفة\s*حالياً\s*للصيانة/g, "currently down for maintenance");
    out = out.replace(/عادت\s*للعمل\s*الآن/g, "back online");
    out = out.replace(/نحيطكم\s*علماً\s*بأن\s*/g, "Please be informed that ");
    out = out.replace(/بنجاح\.?/g, "successfully.");
    out = out.replace(/تم\s*تشغيل/g, "enabled");
    out = out.replace(/تم\s*إيقاف/g, "disabled");
    out = out.replace(/خدمة/g, "service");
  } else {
    // Arabic mode: API already returns Arabic. Only translate English → Arabic if needed.
    out = out.replace(/Services\s*Alert/g, "تنبيه الخدمات");
    out = out.replace(/^System\s*update\s*:?\s*/i, "تحديث نظام: ");
    out = out.replace(
      /Service\s+(\([^)]+\)|\S+)\s+has\s+been\s+enabled\s*✅?\s*successfully\.?/i,
      "تم تشغيل ✅ خدمة $1 بنجاح."
    );
    out = out.replace(
      /Service\s+(\([^)]+\)|\S+)\s+has\s+been\s+disabled\s*❌?\s*successfully\.?/i,
      "تم إيقاف ❌ خدمة $1 بنجاح."
    );
    out = out.replace(
      /Service\s+(.+?)\s+is\s+currently\s+down\s+for\s+maintenance/i,
      "نحيطكم علماً بأن خدمة $1 متوقفة حالياً للصيانة"
    );
    out = out.replace(
      /Service\s+(.+?)\s+is\s+back\s+online/i,
      "نحيطكم علماً بأن خدمة $1 عادت للعمل الآن"
    );

    // In Arabic mode, never run the generic service-name replacement
    // (it would replace model identifiers like "Plant-CNN-v2.3" with full Arabic service names)
    return out.replace(/\s+/g, " ").trim();
  }

  // ===== Generic service/status fallback (English mode only, no specific match) =====
  const svc = findService(out);
  if (svc) out = out.replace(svc.ar, svc.en);

  for (const k of Object.keys(STATUS_WORDS) as (keyof typeof STATUS_WORDS)[]) {
    const w = STATUS_WORDS[k];
    out = out.replace(new RegExp(w.ar, "g"), w.en);
  }

  const KEYWORDS: Array<[RegExp, string, string]> = [
    [/\bservice\b/ig, "service", "الخدمة"],
    [/\bsetting\b/ig, "setting", "الإعداد"],
    [/\bmodel\b/ig, "model", "النموذج"],
    [/\bsystem\b/ig, "system", "النظام"],
    [/\bnew message\b/ig, "new message", "رسالة جديدة"],
    [/\balert\b/ig, "alert", "تنبيه"],
    [/\bupdated\b/ig, "updated", "تم التحديث"],
  ];
  for (const [re, en, ar] of KEYWORDS) {
    out = out.replace(new RegExp(ar, "g"), en);
  }

  return out.replace(/\s+/g, " ").trim();
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
  const title = (n.title || "").toString().toLowerCase();
  if (title.startsWith("[admin]")) return role === "admin";
  if (title.startsWith("[farmer]")) return role === "farmer";

  const explicit = (n.role || n.scope || n.audience || "").toString().toLowerCase();
  if (explicit === "admin" || explicit === "farmer") return explicit === role;

  const serviceType = (n.service_type || "").toString().toLowerCase();
  if (serviceType === "admin_alert") return role === "admin";
  if (serviceType === "farmer_alert" || serviceType === "system") return role === "farmer";

  const type = (n.type || "").toString().toLowerCase();
  if (type.startsWith("admin_") || type.startsWith("admin-")) return role === "admin";
  if (type.startsWith("farmer_") || type.startsWith("farmer-")) return role === "farmer";

  // Untagged → farmer (legacy)
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
        try {
          await deleteAllNotifications(userId);
        } catch {}
        setNotifications([]);
        return;
      }

      const externalData = await getUserNotifications(userId).catch(() => null);
      const externalRaw = Array.isArray(externalData)
        ? externalData
        : externalData?.notifications || externalData?.data || [];

      const filtered = externalRaw.filter((n: any) => matchesRole(n, role));

      const list: Notification[] = filtered.map((n: any) => ({
        id: String(n.id ?? n.notif_id ?? crypto.randomUUID()),
        title: stripRolePrefix(n.title) || "Notification",
        description: stripRolePrefix(n.description ?? n.message ?? null),
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
  }, [checkPushSetting, role]);

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
      .map((n) => {
        let title: string;
        let description: string | null;
        if (role === "admin") {
          // Use translateAdminText only (no localizeText — it would strip model names like "Soil-DL-v2.0")
          title = translateAdminText(n.title, language);
          description = n.description ? translateAdminText(n.description, language) : n.description;
        } else {
          title = localizeText(n.title, language);
          description = localizeText(n.description, language);
        }
        return { ...n, title, description };
      });
  }, [notifications, language, role]);

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
