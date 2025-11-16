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
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
        
        {/* Highlight.js CSS - VS Code Dark Theme */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css"
          integrity="sha512-w6kMPt5Ve3LVlRclsPbgpRs8M+p1tL1y8z/RDPq+p6jQ2uLH/gYJo1YzgNYiJ+IQMhKbPW7MaU7f8tDEF5rC2ww=="
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        
        {/* Highlight.js Script - Load this FIRST */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
          integrity="sha512-D9gUyxqja7hBtkWpPWGt9wfbfaMGVt9gnyCvYa+jojwwPHLCzUm5i8rpk7vD7wNee9bA35eYIjobYPaQuKS1MQ=="
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        
        {/* KaTeX Scripts */}
        <Script
          src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
          integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
          integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
