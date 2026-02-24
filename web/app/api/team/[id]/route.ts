import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const UpdateSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  initials: z.string().optional(),
  email: z.string().optional(),
  linkedin: z.string().optional(),
  photoUrl: z.string().optional(),
  order_index: z.number().int().nonnegative().optional(),
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const json = await request.json()
    const parsed = UpdateSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const p = parsed.data
    const update: any = {}
    if (p.name !== undefined) update.name = p.name
    if (p.role !== undefined) update.role = p.role
    if (p.department !== undefined) update.department = p.department
    if (p.initials !== undefined) update.initials = p.initials
    if (p.email !== undefined) update.email = p.email
    if (p.linkedin !== undefined) update.linkedin = p.linkedin
    if (p.photoUrl !== undefined) update.photo_url = p.photoUrl
    if (p.order_index !== undefined) update.order_index = p.order_index
    const { error } = await supabase.from("ed_cell_team_members").update(update).eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { error } = await supabase.from("ed_cell_team_members").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete member" }, { status: 500 })
  }
}