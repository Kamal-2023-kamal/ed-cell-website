import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const UpdateSchema = z.object({
  title: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  registrationLink: z.string().optional(),
  imageUrl: z.string().optional(),
  order_index: z.number().int().nonnegative().optional(),
  teamSize: z.number().int().positive().optional(),
})

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const json = await request.json()
    const parsed = UpdateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const body = parsed.data
    const update: any = {}
    if (body.title !== undefined) update.title = body.title
    if (body.date !== undefined) update.date = body.date
    if (body.time !== undefined) update.time = body.time
    if (body.location !== undefined) update.location = body.location
    if (body.description !== undefined) update.description = body.description
    if (body.status !== undefined) update.status = body.status
    if (body.registrationLink !== undefined) update.registration_link = body.registrationLink
    if (body.imageUrl !== undefined) update.image_url = body.imageUrl
    if (body.order_index !== undefined) update.order_index = body.order_index
    if (body.teamSize !== undefined) update.team_size = body.teamSize
    let res = await supabase.from("ed_cell_events").update(update).eq("id", id)
    if (res.error && String(res.error.message || "").toLowerCase().includes("team_size")) {
      // Fallback: retry without team_size when the column is missing
      delete (update as any).team_size
      res = await supabase.from("ed_cell_events").update(update).eq("id", id)
    }
    if (res.error) throw res.error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabase.from("ed_cell_events").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete event" }, { status: 500 })
  }
}
