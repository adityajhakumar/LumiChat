"use client"

import { useState, useEffect, useRef } from "react"
import { Copy, Check } from "lucide-react"

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language = "javascript" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState("")
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Load Prism.js from CDN
    if (typeof window !== 'undefined' && !(window as any).Prism) {
      // Load Prism CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'
      document.head.appendChild(link)

      // Load Prism JS
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js'
      script.onload = () => {
        // Load language-specific scripts
        const languages = ['python', 'javascript', 'typescript', 'jsx', 'tsx', 'css', 'markup', 'json', 'bash', 'sql', 'java', 'cpp', 'c', 'csharp', 'go', 'rust', 'ruby', 'php']
        
        languages.forEach(lang => {
          const langScript = document.createElement('script')
          langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`
          document.head.appendChild(langScript)
        })

        // Highlight after loading
        setTimeout(() => {
          if ((window as any).Prism && codeRef.current) {
            (window as any).Prism.highlightElement(codeRef.current)
          }
        }, 100)
      }
      document.head.appendChild(script)
    } else if ((window as any).Prism && codeRef.current) {
      // Prism already loaded, just highlight
      (window as any).Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Map common language names to Prism language classes
  const languageMap: { [key: string]: string } = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    yml: 'yaml',
    md: 'markdown',
    html: 'markup',
    xml: 'markup',
  }

  const prismLanguage = languageMap[language.toLowerCase()] || language.toLowerCase()

  return (
    <div className="relative bg-[#1A1A1A] rounded-lg overflow-hidden my-4 border border-[#3A3A3A]">
      {/* Header bar with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[#3A3A3A]">
        {/* Language Badge */}
        <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
          {language}
        </span>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#2A2A2A] hover:bg-[#353535] text-[#A0A0A0] hover:text-[#ECECEC] transition-all text-xs font-medium"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax Highlighted Code Content */}
      <div className="overflow-x-auto">
        <pre 
          className="!m-0 !p-4 !bg-[#1A1A1A]"
          style={{
            fontSize: '0.875rem',
            lineHeight: '1.6',
          }}
        >
          <code 
            ref={codeRef}
            className={`language-${prismLanguage}`}
            style={{
              fontFamily: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            }}
          >
            {code}
          </code>
        </pre>
      </div>

      <style jsx>{`
        pre[class*="language-"] {
          background: #1A1A1A !important;
        }
        code[class*="language-"] {
          background: transparent !important;
          text-shadow: none !important;
        }
      `}</style>
    </div>
  )
}
