import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#1E1E1E]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-[#171717] border-[#2E2E2E]">
            <CardHeader>
              <CardTitle className="text-2xl text-[#E5E5E0]">
                Check your email
              </CardTitle>
              <CardDescription className="text-[#9B9B95]">
                We&apos;ve sent you a confirmation link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#9B9B95]">
                Please check your email to confirm your account. Once confirmed, you can log in to LumiChat and all your chat history will be synced across devices.
              </p>
              <Link href="/auth/login" className="block">
                <Button className="w-full bg-[#CC785C] hover:bg-[#B86A4D] text-white">
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
