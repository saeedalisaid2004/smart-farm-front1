import { useState, useEffect, useCallback } from "react";
import { getMyMessages, getAllMessages, getExternalUserId } from "@/services/smartFarmApi";

export function useUnreadMessages(role: "farmer" | "admin") {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      if (role === "farmer") {
        const userId = getExternalUserId();
        if (!userId) return;
        const data = await getMyMessages(userId);
        const msgs = Array.isArray(data) ? data : [];
        // Count messages with admin reply that farmer hasn't read
        setCount(msgs.filter((m: any) => m.is_read === false && m.admin_reply).length);
      } else {
        const data = await getAllMessages();
        const msgs = Array.isArray(data) ? data : [];
        // Count pending (unreplied) messages
        setCount(msgs.filter((m: any) => m.status?.toLowerCase() !== "replied").length);
      }
    } catch {
      setCount(0);
    }
  }, [role]);

  useEffect(() => {
    fetchCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    // Listen for message events
    const handler = () => setTimeout(fetchCount, 500);
    window.addEventListener("messages-updated", handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener("messages-updated", handler);
    };
  }, [fetchCount]);

  return count;
}
