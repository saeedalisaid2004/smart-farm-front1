import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const requestSchema = z.object({
  action: z.enum(["get_many", "upsert", "delete"]),
  user_id: z.string().min(1),
  session_id: z.string().optional(),
  title: z.string().trim().min(1).max(120).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const parsed = requestSchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, user_id, session_id, title } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (action === "get_many") {
      const { data, error } = await supabase
        .from("chatbot_session_titles")
        .select("session_id, title")
        .eq("external_user_id", user_id);

      if (error) throw error;

      return new Response(JSON.stringify({ titles: data ?? [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!session_id) {
      return new Response(JSON.stringify({ error: "session_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "upsert") {
      if (!title) {
        return new Response(JSON.stringify({ error: "title required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase
        .from("chatbot_session_titles")
        .upsert(
          {
            external_user_id: user_id,
            session_id,
            title,
          },
          { onConflict: "external_user_id,session_id" },
        )
        .select("session_id, title")
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ status: "success", title: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await supabase
      .from("chatbot_session_titles")
      .delete()
      .eq("external_user_id", user_id)
      .eq("session_id", session_id);

    if (error) throw error;

    return new Response(JSON.stringify({ status: "success" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});