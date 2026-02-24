import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const UpdateSchema = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  tags: z.string().optional(),
  visible: z.boolean().optional(),
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
    if (p.src !== undefined) update.src = p.src
    if (p.alt !== undefined) update.alt = p.alt
    if (p.caption !== undefined) update.caption = p.caption
    if (p.tags !== undefined) update.tags = p.tags
    if (p.visible !== undefined) update.visible = p.visible
    if (p.order_index !== undefined) update.order_index = p.order_index
    const { error } = await supabase.from("ed_cell_gallery_items").update(update).eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const { error } = await supabase.from("ed_cell_gallery_items").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete item" }, { status: 500 })
  }
}