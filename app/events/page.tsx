 "use client"
 
 import { Suspense, useEffect, useMemo, useState } from "react"
import { Calendar, Clock, MapPin, Image as ImageIcon, Share2, CalendarPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useSearchParams, useRouter } from "next/navigation"

type EventItem = {
  id?: string
  title: string
  date: string
  time: string
  location: string
  description: string
  status: string
  registrationLink?: string
  imageUrl?: string
  teamSize?: number
}

type GalleryItem = {
  id: string
  src: string
  alt: string
  caption?: string
  tags?: string
  visible?: boolean
}

function slugify(text: string) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function EventsContent() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<EventItem | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [rsvpName, setRsvpName] = useState("")
  const [rsvpEmail, setRsvpEmail] = useState("")
  const [rsvpQr, setRsvpQr] = useState<string | null>(null)
  const [rsvpCode, setRsvpCode] = useState<string | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [rsvpRegNo, setRsvpRegNo] = useState("")
  const [rsvpPhone, setRsvpPhone] = useState("")
  const [teamMembers, setTeamMembers] = useState<Array<{ name: string; regNo?: string }>>([])
 
   useEffect(() => {
     const fetchAll = async () => {
       try {
         const [er, gr] = await Promise.all([fetch("/api/events"), fetch("/api/gallery")])
         const ejson = await er.json()
         const gjson = await gr.json()
         const edata = Array.isArray(ejson.data) ? ejson.data : []
         const gdata = Array.isArray(gjson.data) ? gjson.data : []
         setEvents(
           edata.map((e: any) => ({
             id: e.id,
             title: e.title ?? "",
             date: e.date ?? "",
             time: e.time ?? "",
             location: e.location ?? "",
             description: e.description ?? "",
             status: e.status ?? "Coming Soon",
             registrationLink: e.registration_link ?? "",
             imageUrl: e.image_url ?? "",
            teamSize: e.team_size ?? 1,
           })),
         )
         setGallery(
           gdata
             .map((i: any) => ({
               id: i.id,
               src: i.src,
               alt: i.alt ?? "",
               caption: i.caption ?? "",
               tags: i.tags ?? "",
               visible: i.visible !== false,
             }))
             .filter((i: GalleryItem) => i.visible !== false),
         )
       } catch {
         setEvents([])
         setGallery([])
       }
     }
     fetchAll()
   }, [])
 
  useEffect(() => {
    const id = searchParams.get("event")
    if (!id || events.length === 0) return
    const ev = events.find((e) => e.id === id)
    if (ev) {
      setSelected(ev)
      setOpen(true)
    }
  }, [searchParams, events])

   const relatedImages = useMemo(() => {
     if (!selected) return []
     const tag = slugify(selected.title)
     return gallery.filter((g) => {
       const tags = (g.tags || "")
         .split(",")
         .map((t) => t.trim().toLowerCase())
         .filter(Boolean)
       return tags.includes(tag)
     })
   }, [selected, gallery])
 
  const filteredEvents = useMemo(() => {
    if (statusFilter === "All") return events
    return events.filter((e) => (e.status || "").toLowerCase() === statusFilter.toLowerCase())
  }, [events, statusFilter])

  function datesForCalendar(date: string, time?: string) {
    const d = (date || "").replace(/-/g, "")
    if (!d) return { g: "", iStart: "", iEnd: "" }
    if (!time) {
      const start = d
      const end = d
      return { g: `${start}/${end}`, iStart: `${start}`, iEnd: `${end}` }
    }
    const t = (time || "").replace(":", "")
    const hh = t.slice(0, 2) || "00"
    const mm = t.slice(2, 4) || "00"
    const start = `${d}T${hh}${mm}00`
    const end = `${d}T${hh}${mm}00`
    return { g: `${start}/${end}`, iStart: start, iEnd: end }
  }

  function googleCalUrl(e: EventItem) {
    const { g } = datesForCalendar(e.date, e.time)
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: e.title || "",
      dates: g || "",
      details: e.description || "",
      location: e.location || "",
    })
    return `https://calendar.google.com/calendar/render?${params.toString()}`
  }

  function icsDataUrl(e: EventItem) {
    const { iStart, iEnd } = datesForCalendar(e.date, e.time)
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${e.title || ""}`,
      iStart ? `DTSTART:${iStart}` : "",
      iEnd ? `DTEND:${iEnd}` : "",
      `LOCATION:${e.location || ""}`,
      `DESCRIPTION:${e.description || ""}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean)
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join("\r\n"))}`
  }

  function shareText(e: EventItem) {
    const url = typeof window !== "undefined" ? window.location.origin + "/events" : ""
    const parts = [e.title || "", e.date || "", e.time || "", e.location ? `at ${e.location}` : "", url].filter(Boolean)
    return encodeURIComponent(parts.join(" ").replace(/\s+/g, " ").trim())
  }

  return (
     <div className="relative min-h-screen bg-background">
       <div className="mx-auto max-w-7xl px-6 py-12">
         <div className="text-center">
           <p className="text-sm font-semibold uppercase tracking-widest text-accent">Events</p>
           <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
             Explore Our Events
           </h1>
           <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
             Detailed overview of our programs, workshops, and competitions. Click any event to view details and gallery.
           </p>
         </div>
 
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {["All", "Registrations Open", "Registrations Closed", "Completed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-3 py-1 text-xs ${
                statusFilter === s ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
           <div className="mt-16 text-center text-sm text-muted-foreground">No events found.</div>
         ) : (
           <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
               <Card
                 key={event.id || event.title}
                 className="cursor-pointer transition hover:border-accent/40 hover:shadow-lg"
                 onClick={() => {
                   setSelected(event)
                   setOpen(true)
                 }}
               >
                 <CardContent className="p-0">
                   {event.imageUrl ? (
                     <img
                       src={event.imageUrl}
                       alt={event.title}
                       className="h-40 w-full rounded-t-xl object-cover"
                     />
                   ) : (
                     <div className="flex h-40 w-full items-center justify-center rounded-t-xl bg-secondary/40 text-muted-foreground">
                       <ImageIcon className="h-6 w-6" />
                     </div>
                   )}
                   <div className="p-6">
                     <div className="mb-3 flex items-center justify-between">
                       <Badge variant="secondary" className="bg-accent/10 text-accent">
                         {event.status}
                       </Badge>
                       {event.date ? (
                         <div className="flex items-center gap-1 text-xs text-muted-foreground">
                           <Calendar className="h-3.5 w-3.5 text-accent" />
                           {event.date}
                         </div>
                       ) : null}
                     </div>
                     <div className="text-lg font-semibold text-foreground">{event.title}</div>
                     <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
                     <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                       {event.time ? (
                         <div className="flex items-center gap-2">
                           <Clock className="h-3.5 w-3.5 text-accent" />
                           {event.time}
                         </div>
                       ) : null}
                       {event.location ? (
                         <div className="flex items-center gap-2">
                           <MapPin className="h-3.5 w-3.5 text-accent" />
                           {event.location}
                         </div>
                       ) : null}
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>
         )}
       </div>
 
       <Dialog
         open={open}
         onOpenChange={(v) => {
           setOpen(v)
           if (!v) {
             const url = new URL(window.location.href)
             url.searchParams.delete("event")
             router.replace(url.pathname + url.search, { scroll: false })
           }
         }}
       >
         <DialogContent className="max-w-4xl">
           <DialogHeader>
             <DialogTitle>{selected?.title}</DialogTitle>
           </DialogHeader>
           {selected ? (
             <div className="space-y-6">
               {selected.imageUrl ? (
                 <img
                   src={selected.imageUrl}
                   alt={selected.title}
                   className="h-64 w-full rounded-lg object-cover"
                 />
               ) : null}
 
               <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
                 {selected.date ? (
                   <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4 text-accent" />
                     {selected.date}
                   </div>
                 ) : null}
                 {selected.time ? (
                   <div className="flex items-center gap-2">
                     <Clock className="h-4 w-4 text-accent" />
                     {selected.time}
                   </div>
                 ) : null}
                 {selected.location ? (
                   <div className="flex items-center gap-2">
                     <MapPin className="h-4 w-4 text-accent" />
                     {selected.location}
                   </div>
                 ) : null}
               </div>
 
               <div>
                 <div className="text-lg font-semibold text-foreground">About This Event</div>
                 <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                   {selected.description || "Details will be announced soon."}
                 </p>
               </div>
 
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="gap-2">
                  <a href={googleCalUrl(selected)} target="_blank" rel="noreferrer">
                    <CalendarPlus className="h-4 w-4" />
                    Google Calendar
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href={icsDataUrl(selected)} download={(selected.title || "event") + ".ics"}>
                    <CalendarPlus className="h-4 w-4" />
                    Download ICS
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a href={`https://wa.me/?text=${shareText(selected)}`} target="_blank" rel="noreferrer">
                    <Share2 className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareText(selected)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Share2 className="h-4 w-4" />
                    X
                  </a>
                </Button>
              </div>

              {!selected.registrationLink ? (
                <div className="rounded-lg border border-border p-4">
                  <div className="text-lg font-semibold text-foreground">RSVP</div>
                  {rsvpQr ? (
                    <div className="mt-3 flex items-center gap-4">
                      <img src={rsvpQr} alt="Ticket QR" className="h-36 w-36 rounded border" />
                      <div className="text-sm">
                        <div className="text-muted-foreground">Ticket Code</div>
                        <div className="font-mono text-lg">{rsvpCode}</div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Save this code and show the QR at check‑in.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <input
                        className="h-10 rounded border border-border bg-background px-3 text-sm"
                        placeholder="Full name"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                      />
                      <input
                        className="h-10 rounded border border-border bg-background px-3 text-sm"
                        placeholder="Email"
                        type="email"
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                      />
                      <input
                        className="h-10 rounded border border-border bg-background px-3 text-sm"
                        placeholder="Register number"
                        value={rsvpRegNo}
                        onChange={(e) => setRsvpRegNo(e.target.value)}
                      />
                      <input
                        className="h-10 rounded border border-border bg-background px-3 text-sm"
                        placeholder="Phone number"
                        value={rsvpPhone}
                        onChange={(e) => setRsvpPhone(e.target.value)}
                      />
                      <div className="sm:col-span-2">
                        <div className="text-sm font-medium text-foreground">
                          Team members (optional)
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Up to {(selected.teamSize || 1) - 1} additional members
                        </div>
                        <div className="mt-2 space-y-2">
                          {teamMembers.map((m, idx) => (
                            <div key={idx} className="grid gap-2 sm:grid-cols-2">
                              <input
                                className="h-9 rounded border border-border bg-background px-3 text-sm"
                                placeholder="Member name"
                                value={m.name}
                                onChange={(e) => {
                                  const next = [...teamMembers]
                                  next[idx] = { ...next[idx], name: e.target.value }
                                  setTeamMembers(next)
                                }}
                              />
                              <input
                                className="h-9 rounded border border-border bg-background px-3 text-sm"
                                placeholder="Register number (optional)"
                                value={m.regNo || ""}
                                onChange={(e) => {
                                  const next = [...teamMembers]
                                  next[idx] = { ...next[idx], regNo: e.target.value }
                                  setTeamMembers(next)
                                }}
                              />
                            </div>
                          ))}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              type="button"
                              disabled={teamMembers.length >= Math.max(0, (selected.teamSize || 1) - 1)}
                              onClick={() => setTeamMembers([...teamMembers, { name: "", regNo: "" }])}
                            >
                              Add member
                            </Button>
                            {teamMembers.length > 0 ? (
                              <Button
                                variant="outline"
                                type="button"
                                onClick={() => setTeamMembers(teamMembers.slice(0, -1))}
                              >
                                Remove last
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <Button
                          disabled={!rsvpName || !rsvpEmail || !rsvpRegNo || !rsvpPhone || rsvpLoading}
                          onClick={async () => {
                            if (!selected?.id) return
                            setRsvpLoading(true)
                            try {
                              const res = await fetch(`/api/events/${selected.id}/rsvp`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  fullName: rsvpName,
                                  email: rsvpEmail,
                                  registerNumber: rsvpRegNo,
                                  phone: rsvpPhone,
                                  teamMembers: teamMembers.filter((m) => m.name.trim()),
                                }),
                              })
                              const json = await res.json().catch(() => ({} as any))
                              if (res.ok) {
                                setRsvpQr(json.qr || null)
                                setRsvpCode(json.ticketCode || null)
                              } else {
                                const msg =
                                  (json && (json.error || json.message)) ||
                                  "Unable to RSVP"
                                alert(msg)
                              }
                            } catch {
                              alert("Unable to RSVP")
                            } finally {
                              setRsvpLoading(false)
                            }
                          }}
                        >
                          {rsvpLoading ? "Submitting..." : "Get Ticket"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

               <div>
                 <div className="flex items-center justify-between">
                   <div className="text-lg font-semibold text-foreground">Event Gallery</div>
                   <div className="text-xs text-muted-foreground">
                     Tag: {slugify(selected.title)}
                   </div>
                 </div>
                 {relatedImages.length === 0 ? (
                   <div className="mt-3 text-sm text-muted-foreground">
                     No images linked yet. Add images in Gallery with this tag.
                   </div>
                 ) : (
                   <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                     {relatedImages.map((img) => (
                       <div key={img.id} className="overflow-hidden rounded-lg border">
                         <img src={img.src} alt={img.alt} className="h-40 w-full object-cover" />
                         {img.caption ? (
                           <div className="p-2 text-xs text-muted-foreground">{img.caption}</div>
                         ) : null}
                       </div>
                     ))}
                   </div>
                 )}
               </div>
 
               {selected.registrationLink ? (
                 <div className="flex justify-end">
                   <Button asChild>
                     <a href={selected.registrationLink} target="_blank" rel="noreferrer">
                       Register
                     </a>
                   </Button>
                 </div>
               ) : null}
             </div>
           ) : null}
         </DialogContent>
       </Dialog>
     </div>
   )
 }

export default function EventsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsContent />
    </Suspense>
  )
}
