import { useState, useEffect, useCallback } from "react";

export interface Notification {
  id: string;
  title: string;
  description: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

const STORAGE_KEY = "smart_farm_notifications";

function getStoredNotifications(): Notification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event("notifications-updated"));
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(getStoredNotifications);

  const sync = useCallback(() => {
    setNotifications(getStoredNotifications());
  }, []);

  useEffect(() => {
    window.addEventListener("notifications-updated", sync);
    return () => window.removeEventListener("notifications-updated", sync);
  }, [sync]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    saveNotifications(updated);
    setNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, is_read: true }));
    saveNotifications(updated);
    setNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
    setNotifications(updated);
  };

  return {
    notifications,
    unreadCount,
    loading: false,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: sync,
  };
}
