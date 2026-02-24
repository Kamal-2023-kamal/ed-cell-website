import { NextResponse } from "next/server"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"
import { randomUUID } from "crypto"

const bucket = process.env.NEXT_PUBLIC_EVENTS_IMAGES_BUCKET || "ed-cell-images"

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "Missing file in form data" }, { status: 400 })
    }

    const filename = file.name || "upload"
    const ext = filename.includes(".") ? filename.split(".").pop() : "bin"
    const path = `events/${randomUUID()}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, Buffer.from(arrayBuffer), {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    const publicUrl = data.publicUrl

    return NextResponse.json({ url: publicUrl, path })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to upload image" }, { status: 500 })
  }
}