import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LumiChat-AI orchestration platform",
  description: "Orchestrating intelligent agents for automation",
  generator: "Aditya Kumar Jha",
  icons: {
    icon: "/generated-image (1).png",
    shortcut: "/generated-image (1).png",
    apple: "/generated-image (1).png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* KaTeX for rendering math */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          crossOrigin="anonymous"
        />

        {/* Highlight.js CSS - VS Code Dark Theme 
            FIXED: Removed WRONG integrity hash that broke Chrome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css"
          crossOrigin="anonymous"
        />
      </head>

      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>

        <Analytics />

        {/* Highlight.js Script */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />

        {/* KaTeX Scripts */}
        <Script
          src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Script
          src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
