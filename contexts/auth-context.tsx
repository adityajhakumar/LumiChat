"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

// Provide a default value to prevent undefined context errors
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Track when component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run auth logic after mount
    if (!mounted) return

    // Create supabase client inside useEffect
    const supabase = createClient()

    const initializeAuth = async () => {
      try {
        const { data: { user: initialUser } } = await supabase.auth.getUser()
        setUser(initialUser ?? null)
      } catch (error) {
        console.error("[AuthProvider] Error getting initial user:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: any, session: Session | null) => {
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [mounted])

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("[AuthProvider] Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider. Make sure your component is wrapped with <AuthProvider>.")
  }
  return context
}
