"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"
import { Spinner } from "@/components/ui/spinner"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoggedIn, isReady } = useAuth()

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      router.replace("/admin/login")
    }
  }, [isReady, isLoggedIn, router])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return null
  }

  return children
}
