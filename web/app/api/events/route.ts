import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

let cacheData: any[] | null = null
let cacheAt = 0
const ttlMs = 15000

const EventSchema = z.object({
  title: z.string().min(1),
  date: z.string().optional().default(""),
  time: z.string().optional().default(""),
  location: z.string().optional().default(""),
  description: z.string().optional().default(""),
  status: z.string().optional().default("Coming Soon"),
  registrationLink: z.string().optional().default(""),
  imageUrl: z.string().optional().default(""),
  order_index: z.number().int().nonnegative().optional().default(0),
  teamSize: z.number().int().positive().optional().default(1),
})

export async function GET() {
  try {
    const now = Date.now()
    if (cacheData && now - cacheAt < ttlMs) {
      return new NextResponse(JSON.stringify({ data: cacheData }), {
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=60" },
      })
    }
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    if (!url || !key) {
      return NextResponse.json({ data: [] })
    }
    let resp: any = await supabase
      .from("ed_cell_events")
      .select(
        "id, title, date, time, location, description, status, registration_link, image_url, order_index, team_size, created_at",
      )
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
    if (resp.error && String(resp.error.message || "").toLowerCase().includes("team_size")) {
      resp = await supabase
        .from("ed_cell_events")
        .select(
          "id, title, date, time, location, description, status, registration_link, image_url, order_index, created_at",
        )
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false })
    }
    if (resp.error) throw resp.error
    cacheData = resp.data || []
    cacheAt = Date.now()
    return new NextResponse(JSON.stringify({ data: cacheData }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=0, s-maxage=15, stale-while-revalidate=60" },
    })
  } catch (error: any) {
    console.error("[api/events] GET error:", error?.message || error)
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = EventSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const payload = parsed.data
    // Try with team_size; fallback if the column doesn't exist
    let insertPayload: Record<string, any> = {
      title: payload.title,
      date: payload.date,
      time: payload.time,
      location: payload.location,
      description: payload.description,
      status: payload.status,
      registration_link: payload.registrationLink,
      image_url: payload.imageUrl,
      order_index: payload.order_index,
      team_size: payload.teamSize,
    }
    let resp = await supabase
      .from("ed_cell_events")
      .insert([insertPayload])
      .select(
        "id, title, date, time, location, description, status, registration_link, image_url, order_index, team_size, created_at",
      )
      .single()
    if (resp.error && String(resp.error.message || "").toLowerCase().includes("team_size")) {
      const { team_size, ...noTeam } = insertPayload
      resp = await supabase
        .from("ed_cell_events")
        .insert([noTeam])
        .select(
          "id, title, date, time, location, description, status, registration_link, image_url, order_index, created_at",
        )
        .single()
    }
    if (resp.error) throw resp.error
    return NextResponse.json({ data: resp.data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create event" }, { status: 500 })
  }
}
