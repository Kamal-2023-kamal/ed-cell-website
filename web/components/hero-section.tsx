"use client"

import { ArrowRight, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AnimatedBackground } from "@/components/animated-background"

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-32 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
          <Rocket className="h-4 w-4 text-accent" />
          <span>Department of AI & Data Science</span>
        </div>

        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
          Empowering Student{" "}
          <span className="text-accent">Entrepreneurs</span>
        </h1>

        <p className="mx-auto mt-4 text-pretty text-lg font-medium tracking-wide text-muted-foreground sm:text-xl md:text-2xl">
          Innovate. Build. Lead.
        </p>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground">
          The Entrepreneurship and Development Cell at St. Joseph{"'"}s College of
          Engineering nurtures innovation, builds entrepreneurial mindsets, and
          transforms ideas into impactful ventures through mentorship, resources,
          and community.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="/join">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 text-base px-8"
            >
              Join ED Cell
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <a href="#programs">
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base px-8 border-border text-foreground hover:bg-secondary"
            >
              Explore Programs
            </Button>
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: "500+", label: "Members" },
            { value: "50+", label: "Events" },
            { value: "15+", label: "Startups" },
            { value: "30+", label: "Mentors" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-foreground sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
