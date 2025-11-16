"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // Import on client
        const { createClient } = await import("@/lib/supabase/client");
        const supabase: SupabaseClient = createClient();

        // Initial user fetch
        const { data: { user: initialUser }, error } = await supabase.auth.getUser();

        if (error) {
          console.error("[AuthProvider] Error getting user:", error);
          setUser(null);
        } else {
          setUser(initialUser ?? null);
        }

        // Auth state change listener
        const { data: { subscription: authSubscription } } =
          supabase.auth.onAuthStateChange((_event, session: Session | null) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
          });

        subscription = authSubscription;
      } catch (error) {
        console.error("[AuthProvider] Error initializing auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("[AuthProvider] Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
