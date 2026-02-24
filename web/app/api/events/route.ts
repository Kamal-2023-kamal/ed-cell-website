import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

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
})

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    if (!url || !key) {
      return NextResponse.json({ data: [] })
    }
    const { data, error } = await supabase
      .from("ed_cell_events")
      .select("id, title, date, time, location, description, status, registration_link, image_url, order_index, created_at")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
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
    const { data, error } = await supabase
      .from("ed_cell_events")
      .insert([
        {
          title: payload.title,
          date: payload.date,
          time: payload.time,
          location: payload.location,
          description: payload.description,
          status: payload.status,
          registration_link: payload.registrationLink,
          image_url: payload.imageUrl,
          order_index: payload.order_index,
        },
      ])
      .select(
        "id, title, date, time, location, description, status, registration_link, image_url, order_index, created_at",
      )
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create event" }, { status: 500 })
  }
}
