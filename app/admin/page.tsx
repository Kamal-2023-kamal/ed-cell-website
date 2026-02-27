"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { SubmissionsTable } from "@/components/submissions-table"
import { EventsAdmin } from "@/components/events-admin"
import { TeamAdmin } from "@/components/team-admin"
import { GalleryAdmin } from "@/components/gallery-admin"
import { AdminOverview } from "@/components/admin-overview"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

function AdminDashboardContent() {
  const router = useRouter()
  const search = useSearchParams()
  const initialTab = search.get("tab") || "overview"
  const [tab, setTab] = useState(initialTab)

  useEffect(() => {
    const current = search.get("tab") || "overview"
    setTab(current)
  }, [search])

  const handleTabChange = (newTab: string) => {
    setTab(newTab)
    router.replace(`/admin?tab=${newTab}`)
  }

  const renderContent = () => {
    switch (tab) {
      case "overview":
        return <AdminOverview />
      case "submissions":
        return (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Join ED Cell Submissions
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                View and manage all applications.
              </p>
            </div>
            <SubmissionsTable />
          </div>
        )
      case "events":
        return (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <EventsAdmin />
          </div>
        )
      case "team":
        return (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <TeamAdmin />
          </div>
        )
      case "gallery":
        return (
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <GalleryAdmin />
          </div>
        )
      default:
        return <AdminOverview />
    }
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar activeTab={tab} onTabChange={handleTabChange} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1" />
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              View Live Site
            </Button>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8">
            {renderContent()}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading admin dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}
