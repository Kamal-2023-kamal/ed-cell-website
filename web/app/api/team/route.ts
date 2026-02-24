import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const MemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().optional().default(""),
  department: z.string().optional().default(""),
  initials: z.string().optional().default(""),
  email: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  photoUrl: z.string().optional().default(""),
  order_index: z.number().int().nonnegative().optional().default(0),
})

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ed_cell_team_members")
      .select("id, name, role, department, initials, email, linkedin, photo_url, order_index, created_at")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch team" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = MemberSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const p = parsed.data
    const { error } = await supabase.from("ed_cell_team_members").insert([
      {
        name: p.name,
        role: p.role,
        department: p.department,
        initials: p.initials,
        email: p.email,
        linkedin: p.linkedin,
        photo_url: p.photoUrl,
        order_index: p.order_index,
      },
    ])
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create member" }, { status: 500 })
  }
}