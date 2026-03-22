import { supabase } from "@/integrations/supabase/client";

type NotificationType = "success" | "warning" | "error" | "info";

interface SendNotificationParams {
  title: string;
  description?: string;
  type?: NotificationType;
}

export async function sendNotification({ title, description, type = "info" }: SendNotificationParams) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("notifications").insert({
    user_id: user.id,
    title,
    description: description || null,
    type,
  });
}
