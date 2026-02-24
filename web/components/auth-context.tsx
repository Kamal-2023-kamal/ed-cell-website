"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface AuthContextType {
  isLoggedIn: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
  isReady: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("admin_auth")
    if (stored === "true") {
      setIsLoggedIn(true)
    }
    setMounted(true)
  }, [])

  const login = (username: string, password: string) => {
    if (username === "admin" && password === "admin@2026") {
      setIsLoggedIn(true)
      localStorage.setItem("admin_auth", "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem("admin_auth")
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, isReady: mounted }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
