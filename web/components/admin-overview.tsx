
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Calendar, Image as ImageIcon, Inbox, TrendingUp, UserPlus, Clock } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function AdminOverview() {
  const [stats, setStats] = useState({
    submissions: 0,
    events: 0,
    team: 0,
    gallery: 0,
    pendingSubmissions: 0,
    upcomingEvents: 0,
  })
  const [submissionTrend, setSubmissionTrend] = useState<{ date: string; count: number }[]>([])
  const [yearDistribution, setYearDistribution] = useState<{ name: string; value: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const exportData = async () => {
    try {
      setExporting(true)
      const [subRes, evtRes, teamRes, galRes] = await Promise.all([
        fetch("/api/submissions"),
        fetch("/api/events"),
        fetch("/api/team"),
        fetch("/api/gallery"),
      ])
      const [subs, evts, team, gal] = await Promise.all([
        subRes.json(),
        evtRes.json(),
        teamRes.json(),
        galRes.json(),
      ])
      const payload = {
        timestamp: new Date().toISOString(),
        submissions: subs.data || [],
        events: evts.data || [],
        team: team.data || [],
        gallery: gal.data || [],
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `edcell-backup-${date}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error("Export failed", e)
      alert("Export failed. Check console for details.")
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, evtRes, teamRes, galRes] = await Promise.all([
          fetch("/api/submissions"),
          fetch("/api/events"),
          fetch("/api/team"),
          fetch("/api/gallery"),
        ])

        const subs = await subRes.json()
        const evts = await evtRes.json()
        const team = await teamRes.json()
        const gal = await galRes.json()

        const subData = Array.isArray(subs.data) ? subs.data : []
        const evtData = Array.isArray(evts.data) ? evts.data : []
        
        // Calculate stats
        setStats({
          submissions: subData.length,
          events: evtData.length,
          team: (Array.isArray(team.data) ? team.data : []).length,
          gallery: (Array.isArray(gal.data) ? gal.data : []).length,
          pendingSubmissions: subData.filter((s: any) => !s.tag).length,
          upcomingEvents: evtData.filter((e: any) => e.status !== "Completed").length,
        })

        // Calculate year distribution
        const years: Record<string, number> = {}
        subData.forEach((s: any) => {
          const y = s.year || "Unknown"
          years[y] = (years[y] || 0) + 1
        })
        setYearDistribution(
          Object.entries(years).map(([name, value]) => ({ name, value }))
        )

        // Calculate trends (last 7 days)
        const dates: Record<string, number> = {}
        subData.forEach((s: any) => {
          const date = new Date(s.created_at).toLocaleDateString()
          dates[date] = (dates[date] || 0) + 1
        })
        // Sort by date and take last 7 entries if possible, or just show all
        const sortedDates = Object.entries(dates)
          .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
          .slice(-7)
          .map(([date, count]) => ({ date, count }))
        
        setSubmissionTrend(sortedDates)

      } catch (e) {
        console.error("Failed to fetch dashboard data", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading dashboard overview...</div>
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={exportData} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Download Backup"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submissions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingSubmissions} pending review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.events}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.team}</div>
            <p className="text-xs text-muted-foreground">
              Active core team
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.gallery}</div>
            <p className="text-xs text-muted-foreground">
              Moments captured
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              Submission distribution by year of study.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearDistribution}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Year
                                </span>
                                <span className="font-bold text-muted-foreground">
                                  {payload[0].payload.name}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[0.70rem] uppercase text-muted-foreground">
                                  Count
                                </span>
                                <span className="font-bold">
                                  {payload[0].value}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="currentColor"
                    radius={[4, 4, 0, 0]}
                    className="fill-primary"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest submission trends.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {submissionTrend.length === 0 ? (
                 <p className="text-sm text-muted-foreground">No recent activity.</p>
              ) : (
                submissionTrend.map((item, i) => (
                  <div key={i} className="flex items-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                      <TrendingUp className="h-4 w-4 text-accent" />
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">New Submissions</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <div className="ml-auto font-medium">+{item.count}</div>
                  </div>
                ))
              )}
              {stats.upcomingEvents > 0 && (
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10">
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Upcoming Events</p>
                    <p className="text-xs text-muted-foreground">Scheduled</p>
                  </div>
                  <div className="ml-auto font-medium">{stats.upcomingEvents}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
