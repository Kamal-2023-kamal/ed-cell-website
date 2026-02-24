import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const ReorderSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), order_index: z.number().int().nonnegative() })),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = ReorderSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const { items } = parsed.data
    for (const it of items) {
      const { error } = await supabase
        .from("ed_cell_gallery_items")
        .update({ order_index: it.order_index })
        .eq("id", it.id)
      if (error) throw error
    }
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to reorder gallery" }, { status: 500 })
  }
}