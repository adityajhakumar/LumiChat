import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import "./globals.css"
import { Providers } from "./providers"
import CleanupScript from "@/components/cleanup-script"

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* KaTeX styles */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          crossOrigin="anonymous"
        />

        {/* highlight.js styles */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css"
          crossOrigin="anonymous"
        />
      </head>

      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />

        {/* highlight.js — MUST run AFTER hydration */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="hl-init" strategy="afterInteractive">
          {`window.addEventListener("DOMContentLoaded", () => {
            document.querySelectorAll("pre code").forEach((block) => {
              if (window.hljs) window.hljs.highlightBlock(block);
            });
          });`}
        </Script>

        {/* KaTeX — MUST run AFTER hydration */}
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
        <Script id="katex-init" strategy="afterInteractive">
          {`window.addEventListener("DOMContentLoaded", () => {
            if (window.renderMathInElement) {
              window.renderMathInElement(document.body, {
                delimiters: [
                  { left: "$$", right: "$$", display: true },
                  { left: "$", right: "$", display: false }
                ]
              });
            }
          });`}
        </Script>

      </body>
    </html>
  )
}
