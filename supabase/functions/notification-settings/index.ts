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

    const { action, user_id, role, settings } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userRole = role || "farmer";

    if (action === "get") {
      const { data } = await supabase
        .from("notification_settings")
        .select("push, email, analysis_alerts")
        .eq("external_user_id", String(user_id))
        .eq("role", userRole)
        .maybeSingle();

      return new Response(
        JSON.stringify({
          current_settings: data || { push: true, email: true, analysis_alerts: true },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update") {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (settings?.push !== undefined) updates.push = settings.push;
      if (settings?.email !== undefined) updates.email = settings.email;
      if (settings?.analysis_alerts !== undefined) updates.analysis_alerts = settings.analysis_alerts;

      // Upsert: insert if not exists, update if exists
      const { data, error } = await supabase
        .from("notification_settings")
        .upsert(
          {
            external_user_id: String(user_id),
            role: userRole,
            ...updates,
          },
          { onConflict: "external_user_id,role" }
        )
        .select("push, email, analysis_alerts")
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: "success", current_settings: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
