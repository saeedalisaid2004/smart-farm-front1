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

    const { action, user_id, preferences } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get") {
      const { data } = await supabase
        .from("user_preferences")
        .select("onboarding_completed")
        .eq("external_user_id", String(user_id))
        .maybeSingle();

      return new Response(
        JSON.stringify({
          preferences: data || { onboarding_completed: false },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "update") {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (preferences?.onboarding_completed !== undefined) {
        updates.onboarding_completed = preferences.onboarding_completed;
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .upsert(
          {
            external_user_id: String(user_id),
            ...updates,
          },
          { onConflict: "external_user_id" }
        )
        .select("onboarding_completed")
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ status: "success", preferences: data }),
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
