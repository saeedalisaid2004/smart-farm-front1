import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, user_id, notification_id, title, description, type } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;

    switch (action) {
      case "list": {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", String(user_id))
          .order("created_at", { ascending: false })
          .limit(100);
        if (error) throw error;
        result = data;
        break;
      }

      case "create": {
        // Check if user has push notifications enabled
        const { data: settings } = await supabase
          .from("notification_settings")
          .select("push")
          .eq("external_user_id", String(user_id))
          .maybeSingle();

        // If settings exist and push is explicitly false, skip creating notification
        if (settings && settings.push === false) {
          result = { skipped: true, reason: "push_disabled" };
          break;
        }

        const { data, error } = await supabase
          .from("notifications")
          .insert({ user_id: String(user_id), title, description: description || null, type: type || "info" })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      case "mark_read": {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notification_id)
          .eq("user_id", String(user_id));
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "mark_all_read": {
        const { error } = await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", String(user_id))
          .eq("is_read", false);
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "delete": {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("id", notification_id)
          .eq("user_id", String(user_id));
        if (error) throw error;
        result = { success: true };
        break;
      }

      case "clear_all": {
        const { error } = await supabase
          .from("notifications")
          .delete()
          .eq("user_id", String(user_id));
        if (error) throw error;
        result = { success: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
