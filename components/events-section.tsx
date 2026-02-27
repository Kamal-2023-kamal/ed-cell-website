"use client"

import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
type EventItem = {
  id?: string
  title: string
  date: string
  time: string
  location: string
  description: string
  status: string
  registrationLink?: string
}

export function EventsSection() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([])
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events")
        if (!res.ok) throw new Error("Failed to fetch events")
        const json = await res.json()
        const data = Array.isArray(json.data) ? json.data : []
        
        setUpcomingEvents(
          data.map((e: any) => ({
            id: e.id,
            title: e.title ?? "",
            date: e.date ?? "",
            time: e.time ?? "",
            location: e.location ?? "",
            description: e.description ?? "",
            status: e.status ?? "Coming Soon",
            registrationLink: e.registration_link ?? "",
          }))
        )
      } catch (err) {
        console.error("Error loading events:", err)
        setUpcomingEvents([])
      }
    }

    fetchEvents()
  }, [])
  return (
    <section id="events" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Events
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Upcoming Events
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
            Stay connected with the latest happenings and revisit our greatest
            moments.
          </p>
        </div>

        <div className="mt-16">
          <h3 className="mb-8 text-xl font-semibold text-foreground">
            Upcoming Events
          </h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No upcoming events scheduled yet. Please check back later.
            </p>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.title}
                  className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
                >
                  <Badge
                    variant="secondary"
                    className="mb-4 w-fit bg-accent/10 text-accent hover:bg-accent/15"
                  >
                    {event.status}
                  </Badge>
                  <h4 className="text-lg font-semibold text-foreground">
                    {event.title}
                  </h4>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-accent" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-accent" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-accent" />
                      {event.location}
                    </div>
                  </div>
                  {event.registrationLink ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-5 w-full gap-1 border-border text-foreground hover:bg-secondary"
                    >
                      <a href={event.registrationLink} target="_blank" rel="noreferrer">
                        Register Now
                        <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-5 w-full gap-1 border-border text-foreground hover:bg-secondary"
                    >
                      <Link href={`/events?event=${event.id || ""}`}>
                        Apply
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
