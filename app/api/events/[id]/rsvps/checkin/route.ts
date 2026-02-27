import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const CHECKIN_SCHEMA = z.object({
  ticketCode: z.string().min(6),
  checkedIn: z.boolean().optional().default(true),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = CHECKIN_SCHEMA.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { ticketCode, checkedIn } = parsed.data
    const { data, error } = await supabase
      .from("ed_cell_event_rsvps")
      .update({ checked_in: checkedIn, checkin_at: checkedIn ? new Date().toISOString() : null })
      .eq("event_id", id)
      .eq("ticket_code", ticketCode)
      .select("id, checked_in, checkin_at")
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Check-in failed" }, { status: 500 })
  }
}
