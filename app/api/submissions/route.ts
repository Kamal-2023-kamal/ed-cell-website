import { NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin as supabase } from "@/lib/supabase-admin"

const SubmissionSchema = z.object({
  fullName: z.string().min(1),
  registerNumber: z.string().min(1),
  email: z.string().email(),
  department: z.string().min(1),
  year: z.string().min(1),
  reason: z.string().optional().default(""),
  interests: z.array(z.string()).optional().default([]),
  startupExperience: z.string().optional().default(""),
})

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    if (!url || !key) {
      return NextResponse.json({ data: [] })
    }
    const { data, error } = await supabase
      .from("ed_cell_submissions")
      .select("id, full_name, register_number, email, department, year, reason, interests, startup_experience, created_at")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[api/submissions] GET error:", error?.message || error)
    return NextResponse.json({ data: [] })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parsed = SubmissionSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const payload = parsed.data

    // Check for duplicates
    const { data: existing } = await supabase
      .from("ed_cell_submissions")
      .select("id")
      .eq("register_number", payload.registerNumber)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Register Number already exists" }, { status: 409 })
    }

    const { error } = await supabase.from("ed_cell_submissions").insert([
      {
        full_name: payload.fullName,
        register_number: payload.registerNumber,
        email: payload.email,
        department: payload.department,
        year: payload.year,
        reason: payload.reason || "",
        interests: payload.interests || [],
        startup_experience: payload.startupExperience || "",
      },
    ])

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[api/submissions] POST error:", error?.message || error)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }
}
