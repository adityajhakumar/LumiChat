"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { ArrowRight, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push("/")
        router.replace("/")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-[#1A1A1A] via-[#1E1E1E] to-[#252525] relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#CC785C] rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#CC785C] rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-serif text-[#E5E5E0] mb-2">LumiChat</h1>
            <p className="text-sm text-[#9B9B95]">Where your words matter</p>
          </Link>
        </div>

        <Card className="bg-[#171717]/90 border-[#2E2E2E] backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-[#E5E5E0] flex items-center gap-2">
              <LogIn className="w-6 h-6 text-[#CC785C]" />
              Welcome back
            </CardTitle>
            <CardDescription className="text-[#9B9B95]">
              Sign in to access your conversations and continue where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#E5E5E0] text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#2E2E2E] border-[#3E3E38] text-[#E5E5E0] h-11 focus:border-[#CC785C] focus:ring-[#CC785C] transition-colors"
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[#E5E5E0] text-sm font-medium">
                      Password
                    </Label>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-xs text-[#9B9B95] hover:text-[#CC785C] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#2E2E2E] border-[#3E3E38] text-[#E5E5E0] h-11 focus:border-[#CC785C] focus:ring-[#CC785C] transition-colors"
                  />
                </div>
                
                {error && (
                  <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#CC785C] hover:bg-[#B86A4D] text-white h-11 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-[#2E2E2E]">
              <p className="text-center text-sm text-[#9B9B95]">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-[#CC785C] font-medium hover:text-[#B86A4D] transition-colors underline-offset-4 hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#6B6B65] mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-[#9B9B95] hover:text-[#CC785C] transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#9B9B95] hover:text-[#CC785C] transition-colors">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
