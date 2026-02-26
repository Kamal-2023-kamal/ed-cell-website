import { NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from("ed_cell_event_rsvps")
      .select("id, full_name, email, register_number, phone, team_members, ticket_code, checked_in, checkin_at, created_at")
      .eq("event_id", id)
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch RSVPs" }, { status: 500 })
  }
}
