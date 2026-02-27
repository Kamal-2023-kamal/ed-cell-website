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

    const tables = [
      "ed_cell_submissions",
      "ed_cell_events",
      "ed_cell_event_rsvps",
      "ed_cell_team_members",
      "ed_cell_gallery_items",
    ]

    for (const t of tables) {
      const { error } = await supabase.from(t).delete().gte("created_at", "1970-01-01")
      if (error) throw error
    }

    let removedFiles = 0
    let offset = 0
    const limit = 1000
    const paths: string[] = []

    while (true) {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list("events", { limit, offset })
      if (error) break
      if (!data || data.length === 0) break
      for (const f of data) {
        if (f.name) paths.push(`events/${f.name}`)
      }
      if (data.length < limit) break
      offset += limit
    }

    if (paths.length > 0) {
      const { error } = await supabase.storage.from(bucketName).remove(paths)
      if (error) throw error
      removedFiles = paths.length
    }

    return NextResponse.json({
      ok: true,
      cleared_tables: tables,
      removed_files: removedFiles,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
}
