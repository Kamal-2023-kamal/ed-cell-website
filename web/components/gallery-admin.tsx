"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

type GalleryItem = {
  id: string
  src: string
  alt: string
  caption: string
  tags?: string
  visible?: boolean
}

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}

export function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [form, setForm] = useState<GalleryItem>({
    id: "",
    src: "",
    alt: "",
    caption: "",
    tags: "",
    visible: true,
  })

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/gallery")
        if (res.ok) {
          const json = await res.json()
          const data = Array.isArray(json.data) ? json.data : []
          setItems(
            data.map((i: any) => ({
              id: i.id,
              src: i.src ?? "",
              alt: i.alt ?? "",
              caption: i.caption ?? "",
              tags: i.tags ?? "",
              visible: i.visible !== false,
            })),
          )
          return
        }
      } catch (err: any) {
        console.error("API fetch failed:", err)
      }
      setItems([])
    }
    fetchItems()
  }, [])

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch("/api/gallery")
        if (res.ok) {
          const json = await res.json()
          const data = Array.isArray(json.data) ? json.data : []
          setItems(
            data.map((i: any) => ({
              id: i.id,
              src: i.src ?? "",
              alt: i.alt ?? "",
              caption: i.caption ?? "",
              tags: i.tags ?? "",
              visible: i.visible !== false,
            })),
          )
        }
      } catch {}
    }

    const channel = supabase
      .channel("admin-gallery")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ed_cell_gallery_items" },
        () => {
          refresh()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const persistOrder = async (list: GalleryItem[]) => {
    setItems(list)
    const payload = { items: list.map((i, idx) => ({ id: i.id, order_index: idx })) }
    try {
      await fetch("/api/gallery/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("edcell-admin-data-changed"))
    }
  }

  const onAdd = () => {
    setEditing(null)
    setForm({
      id: "",
      src: "",
      alt: "",
      caption: "",
      tags: "",
      visible: true,
    })
    setOpen(true)
  }

  const onEdit = (item: GalleryItem) => {
    setEditing(item)
    setForm(item)
    setOpen(true)
  }

  const onDelete = async (id: string) => {
    try { await fetch(`/api/gallery/${id}`, { method: "DELETE" }) } catch {}
    await persistOrder(items.filter((i) => i.id !== id))
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("edcell-admin-data-changed"))
    }
  }

  const move = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1
    if (target < 0 || target >= items.length) return
    const next = [...items]
    const temp = next[index]
    next[index] = next[target]
    next[target] = temp
    await persistOrder(next)
  }

  const toggleVisible = async (id: string) => {
    const next = items.map((i) =>
      i.id === id
        ? {
            ...i,
            visible: i.visible === false ? true : false,
          }
        : i,
    )
    try {
      const item = next.find((i) => i.id === id)
      if (item) {
        await fetch(`/api/gallery/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visible: item.visible }),
        })
      }
    } catch {}
    await persistOrder(next)
  }

  const onSave = async () => {
    const base: GalleryItem = {
      ...form,
      id: form.id,
      visible: form.visible !== false,
    }
    if (editing) {
      const item: GalleryItem = { ...base, id: editing.id || base.id || uuid() }
      try {
        await fetch(`/api/gallery/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            src: item.src,
            alt: item.alt,
            caption: item.caption,
            tags: item.tags,
            visible: item.visible,
          }),
        })
      } catch {}
      await persistOrder(items.map((i) => (i.id === editing.id ? item : i)))
    } else {
      let created: any = null
      const fallback: GalleryItem = {
        ...base,
        id: base.id || uuid(),
      }
      try {
        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            src: fallback.src,
            alt: fallback.alt,
            caption: fallback.caption,
            tags: fallback.tags,
            visible: fallback.visible,
            order_index: items.length,
          }),
        })
        if (res.ok) {
          const json = await res.json()
          created = json?.data || null
        }
      } catch {}
      const item: GalleryItem = created
        ? {
            id: created.id,
            src: created.src ?? fallback.src,
            alt: created.alt ?? fallback.alt,
            caption: created.caption ?? fallback.caption,
            tags: created.tags ?? fallback.tags,
            visible: created.visible !== false,
          }
        : fallback
      await persistOrder([...items, item])
    }
    setOpen(false)
    setEditing(null)
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("edcell-admin-data-changed"))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Manage Gallery</h3>
        <Button onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead>Image URL</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No gallery images configured
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-secondary/20">
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[220px]">
                      {item.src}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{item.caption}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.tags}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.visible === false ? "Hidden" : "Visible"}
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
                          disabled={index === items.length - 1}
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleVisible(item.id)}
                          aria-label={item.visible === false ? "Show image" : "Hide image"}
                        >
                          {item.visible === false ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(item)}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(item.id)}
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
            <DialogTitle>{editing ? "Edit Image" : "Add Image"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Image URL (e.g. /images/gallery-1.jpg)"
              value={form.src}
              onChange={(e) => setForm({ ...form, src: e.target.value })}
            />
            <Input
              placeholder="Alt text"
              value={form.alt}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
            />
            <Textarea
              placeholder="Caption"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
            />
            <Input
              placeholder="Tags (comma separated)"
              value={form.tags || ""}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
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
