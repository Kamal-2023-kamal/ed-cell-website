"use client"
 
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Copy, Calendar as CalendarIcon, Eye } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { supabase } from "@/lib/supabase-client"

 type EventItem = {
   id: string
   title: string
   date: string
   time: string
   location: string
   description: string
  status: string
  registrationLink?: string
  imageUrl?: string
 }
 
 function uuid() {
   if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
   return Math.random().toString(36).slice(2)
 }
 
 export function EventsAdmin() {
   const [events, setEvents] = useState<EventItem[]>([])
   const [open, setOpen] = useState(false)
   const [editing, setEditing] = useState<EventItem | null>(null)
  const [preview, setPreview] = useState<EventItem | null>(null)
   const [form, setForm] = useState<EventItem>({
     id: "",
     title: "",
     date: "",
     time: "",
     location: "",
     description: "",
    status: "",
    registrationLink: "",
   })
 
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events")
        if (res.ok) {
          const json = await res.json()
          const data = Array.isArray(json.data) ? json.data : []
          setEvents(
            data.map((e: any) => ({
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
          try {
            localStorage.setItem("ed_cell_events", JSON.stringify(data))
          } catch {}
          return
        }
      } catch (err: any) {
        console.error("API fetch failed:", err)
      }
      try {
        const cached = localStorage.getItem("ed_cell_events")
        if (cached) {
          const parsed = JSON.parse(cached)
          const list = Array.isArray(parsed) ? parsed : []
          setEvents(
            list.map((e: any) => ({
              id: e.id || e.id === "" ? e.id : uuid(),
              title: e.title ?? "",
              date: e.date ?? "",
              time: e.time ?? "",
              location: e.location ?? "",
              description: e.description ?? "",
              status: e.status ?? "Coming Soon",
              registrationLink: e.registration_link ?? e.registrationLink ?? "",
              imageUrl: e.image_url ?? e.imageUrl ?? "",
            })),
          )
        } else {
          setEvents([])
        }
      } catch {
        setEvents([])
      }
    }
    fetchEvents()
  }, [])

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/events")
        if (res.ok) {
          const json = await res.json()
          const data = Array.isArray(json.data) ? json.data : []
          setEvents(
            data.map((e: any) => ({
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
          try {
            localStorage.setItem("ed_cell_events", JSON.stringify(data))
          } catch {}
        }
      } catch {}
    }

    const channel = supabase
      .channel("admin-events")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ed_cell_events" },
        () => {
          refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
 
  const persistOrder = async (list: EventItem[]) => {
    setEvents(list)
    const payload = {
      items: list.map((e, idx) => ({ id: e.id, order_index: idx })),
    }
    try {
      await fetch("/api/events/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch {}
    try {
      localStorage.setItem("ed_cell_events", JSON.stringify(list))
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("edcell-admin-data-changed"))
    }
  }
 
   const onAdd = () => {
    setEditing(null)
    setForm({
      id: "",
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      status: "Registrations Open",
      registrationLink: "",
      imageUrl: "",
    })
     setOpen(true)
   }
 
  const onEdit = (e: EventItem) => {
    setEditing(e)
    setForm(e)
    setOpen(true)
  }
 
  const onDuplicate = async (e: EventItem) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${e.title} (Copy)`,
          date: e.date,
          time: e.time,
          location: e.location,
          description: e.description,
          status: e.status,
          registrationLink: e.registrationLink || "",
          imageUrl: e.imageUrl || "",
          order_index: 0,
        }),
      })
      let created: any = null
      if (res.ok) {
        const j = await res.json()
        created = j?.data || null
      }
      const item: EventItem = created
        ? {
            id: created.id,
            title: created.title ?? e.title,
            date: created.date ?? e.date,
            time: created.time ?? e.time,
            location: created.location ?? e.location,
            description: created.description ?? e.description,
            status: created.status ?? e.status,
            registrationLink: created.registration_link ?? e.registrationLink,
            imageUrl: created.image_url ?? e.imageUrl,
          }
        : { ...e, id: uuid(), title: `${e.title} (Copy)` }
      const list = [item, ...events]
      await persistOrder(list)
    } catch {
      alert("Duplicate failed")
    }
  }
 
  const onPreview = (e: EventItem) => {
    setPreview(e)
  }
 
  const onDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" })
      if (!res.ok) {
        alert("Delete failed. Please try again.")
        return
      }
    } catch {
      alert("Delete failed. Please check your connection and try again.")
      return
    }
    const list = events.filter((e) => e.id !== id)
    await persistOrder(list)
    try {
      const ref = await fetch("/api/events")
      if (ref.ok) {
        const json = await ref.json()
        const data = Array.isArray(json.data) ? json.data : []
        setEvents(
          data.map((e: any) => ({
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
        try {
          localStorage.setItem("ed_cell_events", JSON.stringify(data))
        } catch {}
      }
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("edcell-admin-data-changed"))
    }
  }
 
  const onSave = async () => {
    const base: EventItem = { ...form, id: form.id }
    if (editing) {
      const item: EventItem = { ...base, id: editing.id || base.id || uuid() }
      try {
        await fetch(`/api/events/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            date: item.date,
            time: item.time,
            location: item.location,
            description: item.description,
            status: item.status,
            registrationLink: item.registrationLink,
            imageUrl: item.imageUrl,
          }),
        })
      } catch {}
      const next = events.map((e) => (e.id === editing.id ? item : e))
      await persistOrder(next)
    } else {
      let created: any = null
      const fallback: EventItem = {
        ...base,
        id: base.id || uuid(),
        status: base.status || "Registrations Open",
      }
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fallback.title,
            date: fallback.date,
            time: fallback.time,
            location: fallback.location,
            description: fallback.description,
            status: fallback.status,
            registrationLink: fallback.registrationLink,
            imageUrl: fallback.imageUrl,
            order_index: 0,
          }),
        })
        if (res.ok) {
          const json = await res.json()
          created = json?.data || null
        }
      } catch {}
      const item: EventItem = created
        ? {
            id: created.id,
            title: created.title ?? fallback.title,
            date: created.date ?? fallback.date,
            time: created.time ?? fallback.time,
            location: created.location ?? fallback.location,
            description: created.description ?? fallback.description,
            status: created.status ?? fallback.status,
            registrationLink: created.registration_link ?? fallback.registrationLink,
            imageUrl: created.image_url ?? fallback.imageUrl,
          }
        : fallback
      const next = [item, ...events]
      await persistOrder(next)
    }
    setOpen(false)
    setEditing(null)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("edcell-admin-data-changed"))
    }
  }

  const upcomingCount = events.filter((e) => e.status !== "Completed").length
  const completedCount = events.filter((e) => e.status === "Completed").length

  const copyRegistrationLink = async (link?: string) => {
    const finalLink = link || window.location.origin + "/join"
    try {
      await navigator.clipboard.writeText(finalLink)
      alert("Registration link copied to clipboard")
    } catch {
      alert("Unable to copy link")
    }
  }

  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const parseDate = (s: string) => {
    const d = new Date(s)
    return isNaN(d.getTime()) ? undefined : d
  }
  const formatDate = (d: Date | undefined) => {
    if (!d) return ""
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
 
   return (
     <div className="space-y-4">
       <div className="flex items-center justify-between">
         <div className="space-y-1">
           <h3 className="text-lg font-semibold text-foreground">Manage Upcoming Events</h3>
           <p className="text-xs text-muted-foreground">
             {upcomingCount} upcoming • {completedCount} completed
           </p>
         </div>
         <Button onClick={onAdd} className="gap-2">
           <Plus className="h-4 w-4" />
           Add Event
         </Button>
       </div>
 
       <div className="rounded-lg border border-border overflow-hidden">
         <div className="overflow-x-auto">
           <Table>
             <TableHeader>
               <TableRow className="bg-secondary/30">
                 <TableHead>Title</TableHead>
                 <TableHead>Date</TableHead>
                 <TableHead>Time</TableHead>
                 <TableHead>Location</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead>Registration</TableHead>
                 <TableHead className="text-right">Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {events.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                     No upcoming events
                   </TableCell>
                 </TableRow>
               ) : (
                 events.map((e) => (
                   <TableRow key={e.id} className="hover:bg-secondary/20">
                     <TableCell className="font-medium text-foreground">{e.title}</TableCell>
                     <TableCell className="text-muted-foreground">{e.date}</TableCell>
                     <TableCell className="text-muted-foreground">{e.time}</TableCell>
                     <TableCell className="text-muted-foreground">{e.location}</TableCell>
                     <TableCell>
                      <Select
                        value={e.status || "Coming Soon"}
                        onValueChange={async (value) => {
                          const updated = events.map((ev) =>
                             ev.id === e.id ? { ...ev, status: value } : ev,
                           )
                           try {
                             await fetch(`/api/events/${e.id}`, {
                               method: "PUT",
                               headers: { "Content-Type": "application/json" },
                               body: JSON.stringify({ status: value }),
                             })
                           } catch {}
                           await persistOrder(updated)
                         }}
                       >
                         <SelectTrigger className="h-8 w-40">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="Registrations Open">Registrations Open</SelectItem>
                           <SelectItem value="Registrations Closed">Registrations Closed</SelectItem>
                           <SelectItem value="Completed">Completed</SelectItem>
                         </SelectContent>
                       </Select>
                     </TableCell>
                     <TableCell className="text-muted-foreground text-xs">
                       <div className="flex items-center gap-2">
                         <Input
                           placeholder="Registration link"
                           value={e.registrationLink || ""}
                           onChange={async (event) => {
                             const value = event.target.value
                             const updated = events.map((ev) =>
                               ev.id === e.id ? { ...ev, registrationLink: value } : ev,
                             )
                             try {
                               await fetch(`/api/events/${e.id}`, {
                                 method: "PUT",
                                 headers: { "Content-Type": "application/json" },
                                 body: JSON.stringify({ registrationLink: value }),
                               })
                             } catch {}
                             await persistOrder(updated)
                           }}
                           className="h-8 w-52"
                         />
                         <Button
                           size="icon"
                           variant="outline"
                           className="h-8 w-8"
                           onClick={() => copyRegistrationLink(e.registrationLink)}
                           aria-label="Copy registration link"
                         >
                           <Copy className="h-3 w-3" />
                         </Button>
                       </div>
                     </TableCell>
                     <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onPreview(e)} className="gap-2">
                          <Eye className="h-4 w-4" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDuplicate(e)} className="gap-2">
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </Button>
                         <Button variant="outline" size="sm" onClick={() => onEdit(e)} className="gap-2">
                           <Pencil className="h-4 w-4" />
                           Edit
                         </Button>
                         <Button variant="destructive" size="sm" onClick={() => onDelete(e.id)} className="gap-2">
                           <Trash2 className="h-4 w-4" />
                           Delete
                         </Button>
                       </div>
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
         </div>
       </div>
 
       <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild />
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{editing ? "Edit Event" : "Add Event"}</DialogTitle>
           </DialogHeader>
           <div className="space-y-3">
             <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => setDatePickerOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.date ? form.date : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={parseDate(form.date)}
                    onSelect={(d: Date | undefined) => {
                      const s = formatDate(d)
                      setForm({ ...form, date: s })
                      setDatePickerOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                placeholder="Time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
             <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
             <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="space-y-1">
              <div className="text-sm font-medium">Gallery tag</div>
              <div className="flex items-center gap-2">
                <Input
                  value={(form.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}
                  readOnly
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9"
                  onClick={async () => {
                    const tag = (form.title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
                    try {
                      await navigator.clipboard.writeText(tag)
                      alert("Tag copied")
                    } catch {}
                  }}
                  aria-label="Copy gallery tag"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
             <Select
               value={form.status}
               onValueChange={(value) => setForm({ ...form, status: value })}
             >
               <SelectTrigger>
                 <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="Registrations Open">Registrations Open</SelectItem>
                 <SelectItem value="Registrations Closed">Registrations Closed</SelectItem>
                 <SelectItem value="Completed">Completed</SelectItem>
               </SelectContent>
             </Select>
           <Input
             placeholder="Registration link (optional)"
             value={form.registrationLink || ""}
             onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
           />
            <div className="space-y-2">
              <div className="text-sm font-medium">Event Image URL</div>
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Event image"
                  className="h-32 w-full object-cover rounded"
                />
              ) : null}
              <Input
                placeholder="https://..."
                value={form.imageUrl || ""}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
 
      <Dialog open={!!preview} onOpenChange={(v) => !v && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{preview?.title}</DialogTitle>
          </DialogHeader>
          {preview ? (
            <div className="space-y-4 text-sm text-muted-foreground">
              {preview.imageUrl ? (
                <img src={preview.imageUrl} alt={preview.title} className="h-56 w-full rounded object-cover" />
              ) : null}
              <div className="grid gap-2 sm:grid-cols-3">
                {preview.date ? <div>{preview.date}</div> : null}
                {preview.time ? <div>{preview.time}</div> : null}
                {preview.location ? <div>{preview.location}</div> : null}
              </div>
              <div className="text-foreground whitespace-pre-line">{preview.description}</div>
              {preview.registrationLink ? (
                <div className="flex justify-end">
                  <Button asChild>
                    <a href={preview.registrationLink} target="_blank" rel="noreferrer">
                      Open Registration
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
