import { NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const adminSecret = process.env.ADMIN_SETUP_SECRET || ""
const bucketName = process.env.NEXT_PUBLIC_EVENTS_IMAGES_BUCKET || "ed-cell-images"

export async function POST(request: Request) {
  try {
    const secret = request.headers.get("x-admin-secret") || ""
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Ensure storage bucket exists and is public
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets()
    if (listErr) throw listErr
    const hasBucket = (buckets || []).some((b) => b.name === bucketName)
    if (!hasBucket) {
      const { error: createBucketErr } = await supabase.storage.createBucket(bucketName, { public: true })
      if (createBucketErr) throw createBucketErr
    }

    // Ensure bootstrap exists
    const { error: bootErr } = await supabase.rpc("run_setup_bootstrap")
    if (bootErr) throw bootErr

    // Check status
    const { data: status, error: selErr } = await supabase
      .from("setup_status")
      .select("initialized")
      .eq("id", true)
      .single()
    if (selErr) throw selErr

    if (status?.initialized) {
      return NextResponse.json({ message: "Already initialized" })
    }

    // Run main setup
    const { error: setupErr } = await supabase.rpc("run_setup_sql")
    if (setupErr) throw setupErr

    // Mark initialized
    const { error: updErr } = await supabase
      .from("setup_status")
      .update({ initialized: true })
      .eq("id", true)
    if (updErr) throw updErr

    return NextResponse.json({ message: "Setup completed successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}