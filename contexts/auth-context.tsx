"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    let supabase: SupabaseClient | null = null
    let subscription: any = null

    const initializeAuth = async () => {
      try {
        // Import and create client only after component mounts
        const { createClient } = await import("@/lib/supabase/client")
        supabase = createClient()

        // Get initial user
        const { data: { user: initialUser }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.error("[AuthProvider] Error getting user:", error)
          setUser(null)
        } else {
          setUser(initialUser ?? null)
        }

        // Set up auth state listener
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          (_event: any, session: Session | null) => {
            setUser(session?.user ?? null)
            setIsLoading(false)
          }
        )

        subscription = authSubscription
      } catch (error) {
        console.error("[AuthProvider] Error initializing auth:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    return () => {
      subscription?.unsubscribe()
    }
  }, [mounted])

  const signOut = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client")
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
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
