// Deno Edge Function to initialize your database once
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const headers = {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "x-admin-secret, content-type",
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers })
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers })
  }

  const secret = req.headers.get("x-admin-secret")
  const expected = Deno.env.get("ADMIN_SETUP_SECRET")
  if (!expected || secret !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers })
  }

  const url = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!url || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env vars" }), { status: 500, headers })
  }

  const supabase = createClient(url, serviceKey)

  try {
    // Ensure setup_status exists (idempotent)
    await supabase.rpc("run_setup_bootstrap")

    const { data, error: selErr } = await supabase
      .from("setup_status")
      .select("initialized")
      .eq("id", true)
      .single()
    if (selErr) throw selErr
    if (data?.initialized) {
      return new Response(JSON.stringify({ message: "Already initialized" }), { status: 200, headers })
    }

    const { error: rpcErr } = await supabase.rpc("run_setup_sql")
    if (rpcErr) throw rpcErr

    const { error: updErr } = await supabase
      .from("setup_status")
      .update({ initialized: true })
      .eq("id", true)
    if (updErr) throw updErr

    return new Response(JSON.stringify({ message: "Setup completed successfully" }), { status: 200, headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers })
  }
})