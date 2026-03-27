import { useState, useEffect, useCallback } from "react";
import { getUserNotifications, getExternalUserId } from "@/services/smartFarmApi";
// Merged: API + local analysis notifications

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
  source: "api" | "local";
}

const READ_IDS_KEY = "notifications_read_ids";
const DELETED_IDS_KEY = "notifications_deleted_ids";
const LOCAL_STORAGE_KEY = "app_notifications";

function getStoredSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function storeSet(key: string, set: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...set]));
}

function getLocalNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((n: any) => ({
      id: String(n.id ?? crypto.randomUUID()),
      title: n.title ?? "Notification",
      description: n.description ?? null,
      type: n.type ?? "info",
      is_read: n.is_read ?? false,
      created_at: n.created_at ?? new Date().toISOString(),
      source: "local" as const,
    }));
  } catch {
    return [];
  }
}

export function useNotifications() {
  const [apiNotifications, setApiNotifications] = useState<Notification[]>([]);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(getLocalNotifications());
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(getStoredSet(READ_IDS_KEY));
  const [deletedIds, setDeletedIds] = useState<Set<string>>(getStoredSet(DELETED_IDS_KEY));

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const userId = getExternalUserId();

    if (!userId) {
      setApiNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getUserNotifications(userId);
      if (Array.isArray(data)) {
        const mapped: Notification[] = data.map((n: any) => ({
          id: `api_${n.id ?? n.notification_id ?? crypto.randomUUID()}`,
          title: n.title ?? n.message ?? "Notification",
          description: n.description ?? n.body ?? null,
          type: n.type ?? "info",
          is_read: n.is_read ?? false,
          created_at: n.created_at ?? n.date ?? new Date().toISOString(),
          source: "api" as const,
        }));
        setApiNotifications(mapped);
      }
    } catch {
      // API unavailable
    }

    // Refresh local
    setLocalNotifications(getLocalNotifications());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const handler = () => {
      setLocalNotifications(getLocalNotifications());
      fetchNotifications();
    };
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
  }, [fetchNotifications]);

  // Merge and sort
  const allNotifications = [...apiNotifications, ...localNotifications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Apply local overrides
  const visibleNotifications = allNotifications
    .filter((n) => !deletedIds.has(n.id))
    .map((n) => (readIds.has(n.id) ? { ...n, is_read: true } : n));

  const unreadCount = visibleNotifications.filter((n) => !n.is_read).length;

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      storeSet(READ_IDS_KEY, next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      allNotifications.forEach((n) => next.add(n.id));
      storeSet(READ_IDS_KEY, next);
      return next;
    });
  }, [allNotifications]);

  const deleteNotification = useCallback((id: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      storeSet(DELETED_IDS_KEY, next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      allNotifications.forEach((n) => next.add(n.id));
      storeSet(DELETED_IDS_KEY, next);
      return next;
    });
  }, [allNotifications]);

  return {
    notifications: visibleNotifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };
}
