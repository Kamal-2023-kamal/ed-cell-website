"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react"

type TeamMember = {
  id: string
  name: string
  role: string
  department: string
  initials: string
  email?: string
  linkedin?: string
  photoUrl?: string
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

export function TeamAdmin() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState<TeamMember>({
    id: "",
    name: "",
    role: "",
    department: "",
    initials: "",
    email: "",
    linkedin: "",
    photoUrl: "",
  })

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/team")
        if (!res.ok) throw new Error("API fetch failed")
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
          })),
        )
      } catch (err: any) {
        console.error("API fetch failed:", err)
        alert(`Failed to load team members: ${err.message}`)
        setMembers([])
      }
    }
    fetchMembers()
  }, [])

  const persistOrder = async (list: TeamMember[]) => {
    setMembers(list)
    const payload = { items: list.map((m, idx) => ({ id: m.id, order_index: idx })) }
    try {
      await fetch("/api/team/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch {}
    try { localStorage.setItem("ed_cell_team", JSON.stringify(list)) } catch {}
  }

  const onAdd = () => {
    setEditing(null)
    setForm({
      id: "",
      name: "",
      role: "",
      department: "",
      initials: "",
      email: "",
      linkedin: "",
      photoUrl: "",
    })
    setOpen(true)
  }

  const onEdit = (m: TeamMember) => {
    setEditing(m)
    setForm(m)
    setOpen(true)
  }

  const onDelete = async (id: string) => {
    try { await fetch(`/api/team/${id}`, { method: "DELETE" }) } catch {}
    await persistOrder(members.filter((m) => m.id !== id))
  }

  const move = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= members.length) return
    const next = [...members]
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    await persistOrder(next)
  }

  const onSave = async () => {
    const initials =
      form.initials ||
      form.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    const item: TeamMember = { ...form, id: form.id || uuid(), initials }
    if (editing) {
      try {
        await fetch(`/api/team/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            role: item.role,
            department: item.department,
            initials: item.initials,
            email: item.email,
            linkedin: item.linkedin,
            photoUrl: item.photoUrl,
          }),
        })
      } catch {}
      await persistOrder(members.map((m) => (m.id === editing.id ? item : m)))
    } else {
      try {
        await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            role: item.role,
            department: item.department,
            initials: item.initials,
            email: item.email,
            linkedin: item.linkedin,
            photoUrl: item.photoUrl,
            order_index: members.length,
          }),
        })
      } catch {}
      await persistOrder([...members, item])
    }
    setOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Manage Team</h3>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Year/Dept</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>LinkedIn</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No team members configured
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m, index) => (
                  <TableRow key={m.id} className="hover:bg-secondary/20">
                    <TableCell className="font-medium text-foreground">{m.name}</TableCell>
                    <TableCell className="text-muted-foreground">{m.role}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{m.department}</TableCell>
                    <TableCell className="text-muted-foreground text-xs truncate max-w-[140px]">
                      {m.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs truncate max-w-[160px]">
                      {m.linkedin}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs truncate max-w-[120px]">
                      {m.photoUrl}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => move(index, "up")}
                          disabled={index === 0}
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => move(index, "down")}
                          disabled={index === members.length - 1}
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(m)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(m.id)}
                          className="gap-2"
                        >
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
            <DialogTitle>{editing ? "Edit Member" : "Add Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Role (Coordinator, Student Lead, etc.)"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
            <Input
              placeholder="Year / Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <Input
              placeholder="Initials (optional)"
              value={form.initials}
              onChange={(e) => setForm({ ...form, initials: e.target.value })}
            />
            <Input
              placeholder="Email (optional)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              placeholder="LinkedIn URL (optional)"
              value={form.linkedin}
              onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
            />
            <Input
              placeholder="Photo URL (optional, e.g. /images/team-1.jpg)"
              value={form.photoUrl}
              onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
