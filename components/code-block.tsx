"use client"

import { useEffect, useRef, useState } from "react"
import { Copy, Check } from "lucide-react"

interface CodeBlockProps {
  code: string
  language?: string
}

declare global {
  interface Window {
    Prism?: any
    __prismLoaded?: boolean
  }
}

export default function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const loadPrism = async () => {
      if (typeof window === "undefined") return

      // Only load once
      if (!window.__prismLoaded) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href =
          "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
        document.head.appendChild(link)

        const script = document.createElement("script")
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
        script.onload = () => {
          window.__prismLoaded = true
          const langs = [
            "python",
            "javascript",
            "typescript",
            "jsx",
            "tsx",
            "css",
            "markup",
            "json",
            "bash",
            "sql",
            "java",
            "cpp",
            "c",
            "csharp",
            "go",
            "rust",
            "ruby",
            "php",
          ]
          langs.forEach((lang) => {
            const langScript = document.createElement("script")
            langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`
            document.head.appendChild(langScript)
          })
        }
        document.head.appendChild(script)
      }

      // Wait a bit for scripts, then highlight
      const tryHighlight = () => {
        if (window.Prism && codeRef.current) {
          window.Prism.highlightElement(codeRef.current)
        } else {
          requestAnimationFrame(tryHighlight)
        }
      }
      tryHighlight()
    }

    loadPrism()
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    yml: "yaml",
    md: "markdown",
    html: "markup",
    xml: "markup",
  }

  const prismLang = langMap[language.toLowerCase()] || language.toLowerCase()

  return (
    <div className="relative bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#3A3A3A] my-4">
      <div className="flex justify-between items-center bg-[#252525] px-4 py-2 border-b border-[#3A3A3A]">
        <span className="text-xs uppercase text-[#A0A0A0]">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-[#2A2A2A] hover:bg-[#353535] text-[#A0A0A0] hover:text-[#ECECEC]"
        >
          {copied ? <><Check size={14}/>Copied!</> : <><Copy size={14}/>Copy</>}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="!m-0 !p-4">
          <code
            ref={codeRef}
            className={`language-${prismLang}`}
            style={{
              fontFamily:
                '"Fira Code", "Cascadia Code", "SF Mono", Menlo, Consolas, monospace',
            }}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}
