"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

// Use undefined as default to properly detect missing provider
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
  }, []) // Empty dependency array - run once on mount

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
    // This error means AuthProvider is not wrapping the component
    console.error("useAuth was called outside of AuthProvider. Component tree:", {
      error: "Missing AuthProvider wrapper",
      solution: "Ensure <AuthProvider> wraps your app in layout.tsx"
    })
    throw new Error("useAuth must be used within AuthProvider. Make sure your component is wrapped with <AuthProvider>.")
  }
  return context
}
