"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Linkedin, Mail } from "lucide-react"

type TeamMember = {
  id?: string
  name: string
  role: string
  department: string
  initials: string
  email?: string
  linkedin?: string
  photoUrl?: string
}

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/team")
        if (!res.ok) throw new Error("Failed to fetch team")
        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []
        
        setMembers(
          data.map((m: any) => ({
            id: m.id,
            name: m.name ?? "",
            role: m.role ?? "",
            department: m.department ?? "",
            initials: m.initials ?? "",
            email: m.email ?? "",
            linkedin: m.linkedin ?? "",
            photoUrl: m.photo_url ?? "",
          }))
        )
      } catch (err) {
        console.error("Error loading team:", err)
        setMembers([])
      }
    }

    fetchTeam()
  }, [])
  return (
    <section id="team" className="relative py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Our Team
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Meet the Core Team
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            Passionate students and faculty members driving the entrepreneurial
            culture at SJCE.
          </p>
        </div>

        {members.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            No team members added yet. Configure the team from the admin dashboard.
          </p>
        ) : (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {members.map((member) => (
            <div
              key={member.name}
              className="group relative flex flex-col items-start rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:translate-y-0.5"
            >
              <div className="w-full h-56 sm:h-64 bg-secondary">
                <Image
                  src={member.photoUrl ? member.photoUrl : "/placeholder-user.jpg"}
                  alt={member.name}
                  width={960}
                  height={720}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full bg-foreground/[0.06] p-5 text-center">
                <h3 className="text-base font-semibold text-foreground">{member.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
                <div className="mt-3">
                  {member.linkedin || member.email ? (
                    <a
                      href={member.linkedin ? member.linkedin : `mailto:${member.email}`}
                      target={member.linkedin ? "_blank" : undefined}
                      rel={member.linkedin ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 rounded-md bg-yellow-600/80 px-3 py-1.5 text-xs font-medium text-black hover:bg-yellow-600"
                    >
                      {member.linkedin ? <Linkedin className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      Profile
                    </a>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-xs text-muted-foreground cursor-not-allowed"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      Profile
                    </button>
                  )}
                </div>
              </div>
            
            </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
