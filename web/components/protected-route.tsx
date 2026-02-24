"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-context"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoggedIn, isReady } = useAuth()

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      router.push("/admin/login")
    }
  }, [isReady, isLoggedIn, router])

  if (!isReady) {
    return null
  }

  if (!isLoggedIn) {
    return null
  }

  return children
}
