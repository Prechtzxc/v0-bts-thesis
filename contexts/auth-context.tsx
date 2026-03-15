"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/storage"
import { getCurrentUser, logout as logoutStorage, initializeStorage, setCurrentUser } from "@/lib/storage"
import { loginServerAction } from "@/app/actions/auth"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User | null>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Set mounted state
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const loadUser = () => {
      try {
        // Initialize storage from session
        initializeStorage()
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [mounted])

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      logoutStorage()
      setCurrentUser(null)
      setUser(null)

      // Use server action to bypass RLS with service role key
      const loggedInUser = await loginServerAction(email, password)
      if (loggedInUser) {
        setCurrentUser(loggedInUser as User)
        setUser(loggedInUser as User)
        return loggedInUser as User
      }
      return null
    } catch (error) {
      console.error("Login error:", error)
      return null
    }
  }

  const logout = () => {
    try {
      setUser(null)
      setCurrentUser(null)
      logoutStorage()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
  }

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Backwards compatibility alias
export const useAuthContext = useAuth
