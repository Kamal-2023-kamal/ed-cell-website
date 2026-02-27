import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"
import QRCode from "qrcode"

const MEMBER_SCHEMA = z.object({
  name: z.string().min(1),
  regNo: z.string().optional().default(""),
})

const RSVP_SCHEMA = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  registerNumber: z.string().min(1),
  phone: z.string().min(6),
  teamMembers: z.array(MEMBER_SCHEMA).optional().default([]),
})

function code() {
  const a = Math.random().toString(36).slice(2, 8).toUpperCase()
  const b = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${a}${b}`
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const parsed = RSVP_SCHEMA.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { fullName, email, registerNumber, phone, teamMembers } = parsed.data

    let evResp = await supabase
      .from("ed_cell_events")
      .select("team_size, status")
      .eq("id", id)
      .single()
    if (evResp.error && String(evResp.error.message || "").toLowerCase().includes("team_size")) {
      evResp = await supabase.from("ed_cell_events").select("status").eq("id", id).single()
    }
    if (evResp.error) throw evResp.error
    const ev = evResp.data as any
    const maxTeam = (ev?.team_size as number) || 1
    const teamCount = 1 + (teamMembers?.length || 0)
    if (teamCount > maxTeam) {
      return NextResponse.json({ error: `Team exceeds limit (${maxTeam})` }, { status: 400 })
    }
    let ticket = code()
    for (let i = 0; i < 5; i++) {
      const { data: exists } = await supabase.from("ed_cell_event_rsvps").select("id").eq("ticket_code", ticket).maybeSingle()
      if (!exists) break
      ticket = code()
    }
    const { data, error } = await supabase
      .from("ed_cell_event_rsvps")
      .insert([{
        event_id: id,
        full_name: fullName,
        email,
        register_number: registerNumber,
        phone,
        team_members: teamMembers || [],
        ticket_code: ticket
      }])
      .select("id, ticket_code, created_at")
      .single()
    if (error) throw error
    const payload = `edcell:ticket:${data.ticket_code}`
    const qr = await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, scale: 6 })
    return NextResponse.json({
      ticketCode: data.ticket_code,
      qr,
      createdAt: data.created_at,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "RSVP failed" }, { status: 500 })
  }
}
