"use client"

import { Rocket, Code2, Users, Banknote, GraduationCap } from "lucide-react"

const programs = [
  {
    icon: Rocket,
    title: "Startup Bootcamps",
    description:
      "Intensive programs that take you from idea to MVP. Learn business modeling, market validation, and product development from experienced founders.",
    tag: "Most Popular",
  },
  {
    icon: Code2,
    title: "Hackathons",
    description:
      "Compete in 24-48 hour coding marathons. Build innovative solutions, win prizes, and get noticed by top recruiters and investors.",
    tag: "Upcoming",
  },
  {
    icon: Users,
    title: "Mentorship Programs",
    description:
      "Get paired with industry leaders and successful entrepreneurs for one-on-one mentorship that accelerates your growth.",
    tag: null,
  },
  {
    icon: Banknote,
    title: "Funding & Incubation",
    description:
      "Access seed funding, investor networks, and incubation support to transform your ideas into funded, viable startups.",
    tag: null,
  },
  {
    icon: GraduationCap,
    title: "Workshops & Seminars",
    description:
      "Expert-led sessions on design thinking, pitching, market research, AI for business, and the latest tech trends.",
    tag: null,
  },
]

export function ProgramsSection() {
  return (
    <section id="programs" className="relative py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Programs & Initiatives
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What We Offer
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            From ideation to execution, our programs cover every stage of the
            entrepreneurial journey.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <div
              key={program.title}
              className="group relative flex flex-col rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <program.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {program.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {program.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
