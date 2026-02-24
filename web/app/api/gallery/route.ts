import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const ItemSchema = z.object({
  src: z.string().min(1),
  alt: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  visible: z.boolean().optional().default(true),
  order_index: z.number().int().nonnegative().optional().default(0),
})

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("ed_cell_gallery_items")
      .select("id, src, alt, caption, tags, visible, order_index, created_at")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch gallery" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = ItemSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }
    const p = parsed.data
    const { error } = await supabase.from("ed_cell_gallery_items").insert([
      {
        src: p.src,
        alt: p.alt,
        caption: p.caption,
        tags: p.tags,
        visible: p.visible,
        order_index: p.order_index,
      },
    ])
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create item" }, { status: 500 })
  }
}