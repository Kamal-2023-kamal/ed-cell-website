 "use client"
 
 import { useEffect, useMemo, useState } from "react"
 import { Calendar, Clock, MapPin, Image as ImageIcon, Share2, CalendarPlus } from "lucide-react"
 import { Badge } from "@/components/ui/badge"
 import { Button } from "@/components/ui/button"
 import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
 import { Card, CardContent } from "@/components/ui/card"
 
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
 
 export default function EventsPage() {
   const [events, setEvents] = useState<EventItem[]>([])
   const [gallery, setGallery] = useState<GalleryItem[]>([])
   const [open, setOpen] = useState(false)
   const [selected, setSelected] = useState<EventItem | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("All")
 
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
 
       <Dialog open={open} onOpenChange={setOpen}>
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
