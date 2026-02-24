"use client"
 
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Copy } from "lucide-react"
 
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
       if (!res.ok) throw new Error("API fetch failed")
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
     } catch (err: any) {
      console.error("API fetch failed:", err)
      alert(`Failed to load events: ${err.message}`)
      setEvents([])
    }
  }
   fetchEvents()
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
 
  const onDelete = async (id: string) => {
    try {
      await fetch(`/api/events/${id}`, { method: "DELETE" })
    } catch {}
    const list = events.filter((e) => e.id !== id)
    await persistOrder(list)
  }
 
  const onSave = async () => {
    const item: EventItem = { ...form, id: form.id || uuid() }
    if (editing) {
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
      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: item.title,
            date: item.date,
            time: item.time,
            location: item.location,
            description: item.description,
            status: item.status || "Registrations Open",
            registrationLink: item.registrationLink,
            imageUrl: item.imageUrl,
            order_index: 0,
          }),
        })
      } catch {}
      const next = [item, ...events]
      await persistOrder(next)
    }
    setOpen(false)
    setEditing(null)
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
             <Input placeholder="Date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
             <Input placeholder="Time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
             <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
             <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
              <div className="text-sm font-medium">Event Image</div>
              {form.imageUrl ? (
                <img
                  src={form.imageUrl}
                  alt="Event image"
                  className="h-32 w-full object-cover rounded"
                />
              ) : null}
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const fd = new FormData()
                  fd.append("file", file)
                  try {
                    const res = await fetch("/api/events/image", { method: "POST", body: fd })
                    if (!res.ok) throw new Error("Upload failed")
                    const json = await res.json()
                    setForm({ ...form, imageUrl: json.url })
                  } catch {
                    alert("Failed to upload image")
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={onSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
     </div>
   )
 }
