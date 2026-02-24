"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, Copy, Trash2, CheckSquare, Square } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface Submission {
  id: string
  full_name: string
  register_number: string
  email: string
  department: string
  year: string
  reason: string
  interests: string[]
  startup_experience: string
  created_at: string
  tag?: string
}

export function SubmissionsTable() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterYear, setFilterYear] = useState("all")
  const [filterTag, setFilterTag] = useState("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/submissions")
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API Error: ${res.status}`)
      }
      const json = await res.json()
      const data = Array.isArray(json.data) ? json.data : []
      const mapped: Submission[] = data.map((s: any) => ({
        id: s.id,
        full_name: s.full_name ?? "",
        register_number: s.register_number ?? "",
        email: s.email ?? "",
        department: s.department ?? "",
        year: s.year ?? "",
        reason: s.reason ?? "",
        interests: Array.isArray(s.interests) ? s.interests : [],
        startup_experience: s.startup_experience ?? "",
        created_at: s.created_at ?? new Date().toISOString(),
        tag: s.tag ?? "",
      }))
      setSubmissions(mapped)
    } catch (error: any) {
      console.error("API fetch failed:", error)
      alert(`Failed to load submissions: ${error.message}`)
      setSubmissions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.register_number.includes(searchTerm)
    const matchesYear = filterYear === "all" || sub.year === filterYear
    const matchesTag = filterTag === "all" || (sub.tag || "") === filterTag
    return matchesSearch && matchesYear && matchesTag
  })

  const persistSubmissions = (next: Submission[]) => {
    setSubmissions(next)
    // In a real app with API, we would update the backend here for tags
    // Since we don't have a specific PATCH endpoint for tags in the provided API list, 
    // we'll assume we might add one or just keep local state for now until refreshed.
    // Ideally: await fetch(`/api/submissions/${id}`, { method: 'PATCH', body: ... })
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelected(next)
  }

  const toggleSelectAll = () => {
    if (selected.size === filteredSubmissions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredSubmissions.map((s) => s.id)))
    }
  }

  const deleteSelected = async () => {
    if (!confirm(`Are you sure you want to delete ${selected.size} submissions?`)) return
    
    // Since we don't have a bulk delete API, we'll just simulate it for now 
    // or call delete individually if we had a delete endpoint.
    // Assuming we might need to implement DELETE /api/submissions/[id] later.
    // For now, let's just update UI to show "Deleted" locally or alert.
    alert("Bulk delete functionality requires backend update. (Simulated)")
    
    const next = submissions.filter(s => !selected.has(s.id))
    setSubmissions(next)
    setSelected(new Set())
  }

  const allTags = Array.from(
    new Set(submissions.map((s) => (s.tag || "").trim()).filter(Boolean)),
  )

  const copyEmails = async () => {
    const list = selected.size > 0 
      ? submissions.filter(s => selected.has(s.id))
      : filteredSubmissions
    
    const emails = Array.from(new Set(list.map((s) => s.email).filter(Boolean)))
    const text = emails.join(", ")
    try {
      await navigator.clipboard.writeText(text)
      alert(`Copied ${emails.length} emails to clipboard`)
    } catch {
      alert("Unable to copy emails")
    }
  }

  const copyRegisterNumbers = async () => {
    const list = selected.size > 0 
      ? submissions.filter(s => selected.has(s.id))
      : filteredSubmissions

    const regs = list.map((s) => s.register_number).filter(Boolean)
    const text = regs.join(", ")
    try {
      await navigator.clipboard.writeText(text)
      alert(`Copied ${regs.length} register numbers to clipboard`)
    } catch {
      alert("Unable to copy register numbers")
    }
  }

  const exportCSV = () => {
    const list = selected.size > 0 
      ? submissions.filter(s => selected.has(s.id))
      : filteredSubmissions

    const headers = [
      "Full Name",
      "Register Number",
      "Email",
      "Department",
      "Year",
      "Reason",
      "Interests",
      "Startup Experience",
      "Submitted",
      "Status"
    ]
    const rows = list.map((sub) => [
      sub.full_name,
      sub.register_number,
      sub.email,
      sub.department,
      sub.year,
      sub.reason || "N/A",
      (sub.interests || []).join("; "),
      sub.startup_experience || "N/A",
      new Date(sub.created_at).toLocaleString(),
      sub.tag || "Pending"
    ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ed-cell-submissions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or register number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="I Year">I Year</SelectItem>
                <SelectItem value="II Year">II Year</SelectItem>
                <SelectItem value="III Year">III Year</SelectItem>
                <SelectItem value="IV Year">IV Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                <SelectItem value="Core team">Core team</SelectItem>
                <SelectItem value="Volunteer">Volunteer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-secondary/20 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground px-2">
            {selected.size} selected
          </div>
          <div className="h-4 w-px bg-border mx-2" />
          <Button
            onClick={copyEmails}
            variant="ghost"
            size="sm"
            className="gap-2 h-8"
            disabled={filteredSubmissions.length === 0}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Emails
          </Button>
          <Button
            onClick={copyRegisterNumbers}
            variant="ghost"
            size="sm"
            className="gap-2 h-8"
            disabled={filteredSubmissions.length === 0}
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Reg. Nos
          </Button>
          <Button
            onClick={exportCSV}
            variant="ghost"
            size="sm"
            className="gap-2 h-8"
            disabled={filteredSubmissions.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
          <div className="flex-1" />
          {selected.size > 0 && (
             <Button
              onClick={deleteSelected}
              variant="destructive"
              size="sm"
              className="gap-2 h-8"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Selected
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="w-[40px]">
                  <Checkbox 
                    checked={selected.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Register No.</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interests</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading submissions...
                  </TableCell>
                </TableRow>
              ) : filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-secondary/20" data-state={selected.has(sub.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox 
                        checked={selected.has(sub.id)}
                        onCheckedChange={() => toggleSelect(sub.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {sub.full_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sub.register_number}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {sub.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {sub.year}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <Select
                        value={sub.tag || "none"}
                        onValueChange={(value) => {
                          const next = submissions.map((s) =>
                            s.id === sub.id ? { ...s, tag: value === "none" ? "" : value } : s,
                          )
                          persistSubmissions(next)
                        }}
                      >
                        <SelectTrigger className="h-8 w-32 border-transparent bg-transparent hover:bg-secondary focus:ring-0">
                          <div className="flex items-center gap-2">
                            {sub.tag ? (
                               <Badge variant="outline" className={`
                                 ${sub.tag === 'Shortlisted' ? 'border-blue-500 text-blue-500' : ''}
                                 ${sub.tag === 'Core team' ? 'border-green-500 text-green-500' : ''}
                                 ${sub.tag === 'Volunteer' ? 'border-yellow-500 text-yellow-500' : ''}
                                 ${sub.tag === 'Rejected' ? 'border-red-500 text-red-500' : ''}
                               `}>
                                 {sub.tag}
                               </Badge>
                            ) : (
                              <span className="text-muted-foreground">Pending</span>
                            )}
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Pending</SelectItem>
                          <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                          <SelectItem value="Core team">Core team</SelectItem>
                          <SelectItem value="Volunteer">Volunteer</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {(sub.interests || []).slice(0, 2).join(", ")}
                      {(sub.interests || []).length > 2 && ` +${(sub.interests || []).length - 2}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(sub.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredSubmissions.length} of {submissions.length} submissions
      </div>
    </div>
  )
}
