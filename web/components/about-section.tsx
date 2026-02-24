"use client"

import { Target, Eye, Lightbulb } from "lucide-react"

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To inspire students to think like entrepreneurs through hands-on learning and real experiences, connect classroom knowledge with practical business and development insights, promote creative thinking and problem-solving to address real-world challenges, build strong connections with industry experts and encourage meaningful collaboration, and guide and support students in shaping sustainable and impactful initiatives.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    description:
      "To create a vibrant platform where entrepreneurial ideas are encouraged, innovation is celebrated, and students are empowered to turn their ideas into meaningful ventures that make a real difference in society and industry.",
  },
  {
    icon: Lightbulb,
    title: "What We Do & Our Core Values",
    description:
      "At EDS, we turn ideas into action through workshops and speaker sessions, ideation and pitch platforms, innovation challenges, industry and alumni connect, and startup support that helps students transform ideas into sustainable ventures. Our core values are innovation, collaboration, initiative, impact, and a growth mindset, which guide how we think, build, and grow together.",
  },
]

export function AboutSection() {
  return (
    <section id="about" className="relative py-24 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            About Us
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Driving Innovation & Entrepreneurship
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            The ED Cell bridges the gap between academia and industry, empowering
            students to think beyond textbooks and create solutions that matter.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {pillar.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
