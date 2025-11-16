"use client"

import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
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
          <CardHeader className="space-y-1 pb-6 text-center">
            {/* Success Icon */}
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            
            <CardTitle className="text-2xl font-semibold text-[#E5E5E0]">
              Check your email
            </CardTitle>
            <CardDescription className="text-[#9B9B95]">
              We&apos;ve sent you a confirmation link
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Email Icon and Message */}
            <div className="p-4 rounded-lg bg-[#2E2E2E]/50 border border-[#3E3E38] flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#CC785C]/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#CC785C]" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#E5E5E0] font-medium mb-1">
                  Verify your email address
                </p>
                <p className="text-xs text-[#9B9B95] leading-relaxed">
                  Please check your inbox and click the confirmation link to activate your account. 
                  Once confirmed, you&apos;ll have access to all LumiChat features.
                </p>
              </div>
            </div>

            {/* What's Next */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#E5E5E0]">What happens next?</p>
              <ul className="space-y-2">
                {[
                  "Click the link in your email to verify",
                  "Your account will be activated instantly",
                  "All your chats will sync across devices",
                  "Start chatting with advanced AI models"
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#9B9B95]">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#CC785C]/20 text-[#CC785C] flex items-center justify-center text-[10px] font-medium mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {/* Didn't receive email */}
            <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-900/30">
              <p className="text-xs text-blue-400">
                <strong>Didn&apos;t receive the email?</strong> Check your spam folder or try signing up again.
              </p>
            </div>

            <Link href="/auth/login" className="block">
              <Button className="w-full bg-[#CC785C] hover:bg-[#B86A4D] text-white h-11 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                Back to Login
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#6B6B65] mt-6">
          Need help?{" "}
          <Link href="/support" className="text-[#9B9B95] hover:text-[#CC785C] transition-colors">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
