"use client"

import { BrainCircuit, TrendingUp, Database, Cpu } from "lucide-react"

const synergies = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Solutions",
    description:
      "Leverage machine learning and deep learning to build products that solve real-world challenges.",
  },
  {
    icon: Database,
    title: "Data-Driven Decisions",
    description:
      "Use data analytics and visualization to validate ideas and make informed business decisions.",
  },
  {
    icon: TrendingUp,
    title: "Scalable Ventures",
    description:
      "Apply AI and automation principles to build businesses that scale efficiently from day one.",
  },
  {
    icon: Cpu,
    title: "Tech Innovation",
    description:
      "Stay at the forefront of emerging technologies like NLP, computer vision, and generative AI for your startup.",
  },
]

export function DepartmentSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              Department Association
            </p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Department of Artificial Intelligence & Data Science
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
              The ED Cell operates under the Department of AI & Data Science,
              creating a unique synergy between cutting-edge technology and
              entrepreneurial thinking. Our students don{"'"}t just learn AI; they
              build businesses with it.
            </p>
            <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
              This powerful combination enables our members to develop
              AI-powered startups, create data-driven business strategies, and
              leverage the latest in machine learning to solve problems that
              traditional approaches cannot.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {synergies.map((item) => (
              <div
                key={item.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
