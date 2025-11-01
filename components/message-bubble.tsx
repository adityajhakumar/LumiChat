"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Copy, RotateCw, ThumbsUp, ThumbsDown, Check, Edit2, MessageSquare, ChevronDown, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"

interface Thread {
  id: string
  parentText: string
  messages: Array<{ role: string; content: string }>
  collapsed: boolean
}

interface MessageBubbleProps {
  message: { role: string; content: string }
  onRegenerate?: () => void
  onEdit?: () => void
  onCopy?: (content: string) => void
  onFeedback?: (type: "positive" | "negative") => void
  onThreadResponse?: (parentText: string, userMessage: string) => Promise<string>
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState("")

  useEffect(() => {
    const loadHighlightJS = async () => {
      try {
        const checkHljs = () => {
          return new Promise<void>((resolve) => {
            if (typeof window !== 'undefined' && (window as any).hljs) {
              resolve()
            } else {
              const interval = setInterval(() => {
                if (typeof window !== 'undefined' && (window as any).hljs) {
                  clearInterval(interval)
                  resolve()
                }
              }, 100)
              
              setTimeout(() => {
                clearInterval(interval)
                resolve()
              }, 3000)
            }
          })
        }

        await checkHljs()

        if (typeof window !== 'undefined' && (window as any).hljs) {
          const hljs = (window as any).hljs
          const validLang = hljs.getLanguage(language) ? language : 'plaintext'
          const result = hljs.highlight(code, { language: validLang })
          setHighlighted(result.value)
        } else {
          const escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
          setHighlighted(escaped)
        }
      } catch (error) {
        console.error('Highlight.js error:', error)
        const escaped = code
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
        setHighlighted(escaped)
      }
    }

    loadHighlightJS()
  }, [code, language])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative bg-[#1A1A1A] rounded-lg overflow-hidden my-4 border border-[#3A3A3A]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[#3A3A3A]">
        <span className="text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider">
          {language}
        </span>
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

      <pre className="m-0 p-4 overflow-x-auto bg-[#1A1A1A]">
        <code
          className="text-[#D4D4D4] text-sm block hljs"
          style={{
            fontFamily:
              '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
            whiteSpace: "pre",
            wordBreak: "normal",
            wordWrap: "normal",
            lineHeight: "1.5"
          }}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  )
}

function ThreadSection({ 
  thread, 
  onToggle, 
  onReply, 
  onThreadResponse 
}: { 
  thread: Thread
  onToggle: () => void
  onReply: (message: string) => void
  onThreadResponse?: (parentText: string, userMessage: string) => Promise<string>
}) {
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    
    setLoading(true)
    if (onThreadResponse) {
      await onThreadResponse(thread.parentText, replyText)
    }
    onReply(replyText)
    setReplyText("")
    setLoading(false)
  }

  return (
    <div className="ml-6 mt-3 border-l-2 border-[#3A3A3A] pl-4 bg-[#1A1A1A] rounded-r-lg">
      {/* Thread Header */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-xs text-[#A0A0A0] hover:text-[#ECECEC] transition-colors mb-2"
      >
        {thread.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        <MessageSquare size={14} />
        <span className="font-medium">
          {thread.messages.length} {thread.messages.length === 1 ? 'reply' : 'replies'} to:
        </span>
        <span className="italic truncate max-w-[300px]">"{thread.parentText.substring(0, 50)}..."</span>
      </button>

      {/* Thread Content */}
      {!thread.collapsed && (
        <div className="space-y-3">
          {thread.messages.map((msg, idx) => (
            <div key={idx} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[90%] px-3 py-2 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-[#2C2C2C] text-[#ECECEC]' 
                  : 'bg-[#252525] text-[#D4D4D4]'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Reply Input */}
          <div className="flex gap-2 items-end pt-2 border-t border-[#2A2A2A]">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Reply to this thread..."
              className="flex-1 min-h-[60px] bg-[#222222] border-[#3A3A3A] text-white placeholder-[#6B6B6B] text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSendReply()
                }
              }}
            />
            <button
              onClick={handleSendReply}
              disabled={loading || !replyText.trim()}
              className="px-3 py-2 bg-[#CC785C] hover:bg-[#B8674A] disabled:bg-[#6B6B65] text-white rounded-lg text-sm transition-colors"
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MessageBubble({
  message,
  onRegenerate,
  onEdit,
  onCopy,
  onFeedback,
  onThreadResponse
}: MessageBubbleProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedText, setSelectedText] = useState("")
  const [showThreadButton, setShowThreadButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.(message.content)
  }

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(type)
    onFeedback?.(type)
  }

  // Handle text selection for threading
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const text = selection?.toString().trim()
    
    if (text && text.length > 10 && !isUser) {
      setSelectedText(text)
      
      // Get selection position for button placement
      const range = selection?.getRangeAt(0)
      const rect = range?.getBoundingClientRect()
      if (rect) {
        setButtonPosition({
          x: rect.right + 10,
          y: rect.top
        })
      }
      setShowThreadButton(true)
    } else {
      setShowThreadButton(false)
    }
  }

  const handleCreateThread = () => {
    if (!selectedText) return

    const newThread: Thread = {
      id: Date.now().toString(),
      parentText: selectedText,
      messages: [],
      collapsed: false
    }

    setThreads([...threads, newThread])
    setShowThreadButton(false)
    setSelectedText("")
    window.getSelection()?.removeAllRanges()
  }

  const handleThreadReply = async (threadId: string, message: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread) return

    // Add user message
    const updatedThreads = threads.map(t => 
      t.id === threadId 
        ? { ...t, messages: [...t.messages, { role: 'user', content: message }] }
        : t
    )
    setThreads(updatedThreads)

    // Get AI response
    if (onThreadResponse) {
      const aiResponse = await onThreadResponse(thread.parentText, message)
      
      const finalThreads = updatedThreads.map(t =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, { role: 'assistant', content: aiResponse }] }
          : t
      )
      setThreads(finalThreads)
    }
  }

  const toggleThread = (threadId: string) => {
    setThreads(threads.map(t => 
      t.id === threadId ? { ...t, collapsed: !t.collapsed } : t
    ))
  }

  return (
    <div
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-6 sm:mb-8 px-4 sm:px-6 group relative`}
      onMouseUp={handleTextSelection}
    >
      {/* Thread Creation Button */}
      {showThreadButton && (
        <button
          onClick={handleCreateThread}
          className="fixed z-50 bg-[#CC785C] hover:bg-[#B8674A] text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium flex items-center gap-1 transition-colors"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`
          }}
        >
          <MessageSquare size={14} />
          Start Thread
        </button>
      )}

      {isUser ? (
        <div className="max-w-[85%] sm:max-w-[75%]">
          <div className="px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-[#2C2C2C] text-[#ECECEC] shadow-lg border border-[#3A3A3A]">
            <p
              className="text-[15px] sm:text-base leading-relaxed whitespace-pre-wrap break-words"
              style={{
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}
            >
              {message.content}
            </p>
          </div>
          
          {onEdit && (
            <div className="flex items-center gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1.5 rounded-md hover:bg-[#2A2A2A] text-[#A0A0A0] hover:text-[#ECECEC] transition-colors"
                title="Edit message"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-full sm:max-w-[90%] md:max-w-[85%]">
          <div className="bg-transparent text-[#ECECEC] py-1">
            <div
              className="prose prose-invert max-w-none prose-table:border-collapse prose-table:w-full prose-th:border prose-th:border-[#3A3A3A] prose-th:bg-[#2A2A2A] prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-td:border prose-td:border-[#3A3A3A] prose-td:px-4 prose-td:py-2 prose-p:leading-7 prose-p:my-4 prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-ul:my-4 prose-ol:my-4 prose-li:my-1"
              style={{ fontFamily: '"Tiempos Text", Charter, Georgia, serif' }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border-collapse border border-[#3A3A3A] rounded-lg" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-[#2A2A2A]" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="border border-[#3A3A3A] px-4 py-2 text-left font-semibold text-[#ECECEC]" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="border border-[#3A3A3A] px-4 py-2 text-[#D4D4D4]" {...props} />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr className="hover:bg-[#252525] transition-colors" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p className="my-4 leading-7 text-[#ECECEC]" {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className="text-2xl font-semibold my-6 text-[#ECECEC]" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-semibold my-5 text-[#ECECEC]" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-lg font-semibold my-4 text-[#ECECEC]" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="my-4 ml-6 list-disc space-y-2 text-[#ECECEC]" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="my-4 ml-6 list-decimal space-y-2 text-[#ECECEC]" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="my-1 leading-7" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-[#CC785C] pl-4 my-4 italic text-[#D4D4D4]" {...props} />
                  ),
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const isCodeBlock = !inline && className
                    const language =
                      className?.replace("language-", "") || "javascript"
                    const code = String(children).replace(/\n$/, "")

                    return isCodeBlock ? (
                      <CodeBlock code={code} language={language} />
                    ) : (
                      <code
                        className="bg-[#2A2A2A] text-[#E69B8A] px-1.5 py-0.5 rounded text-[14px] font-mono break-words"
                        style={{
                          fontFamily:
                            '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Threads */}
          {threads.length > 0 && (
            <div className="mt-4 space-y-3">
              {threads.map(thread => (
                <ThreadSection
                  key={thread.id}
                  thread={thread}
                  onToggle={() => toggleThread(thread.id)}
                  onReply={(msg) => handleThreadReply(thread.id, msg)}
                  onThreadResponse={onThreadResponse}
                />
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 mt-3 mb-2">
            <button
              onClick={handleCopy}
              className="p-2 rounded-md hover:bg-[#2A2A2A] text-[#A0A0A0] hover:text-[#ECECEC] transition-colors"
              title="Copy message"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-2 rounded-md hover:bg-[#2A2A2A] text-[#A0A0A0] hover:text-[#ECECEC] transition-colors"
                title="Regenerate response"
              >
                <RotateCw size={16} />
              </button>
            )}

            <button
              onClick={() => handleFeedback("positive")}
              className={`p-2 rounded-md transition-colors ${
                feedback === "positive"
                  ? "bg-[#2A2A2A] text-[#4CAF50]"
                  : "hover:bg-[#2A2A2A] text-[#A0A0A0] hover:text-[#ECECEC]"
              }`}
              title="Good response"
            >
              <ThumbsUp size={16} />
            </button>

            <button
              onClick={() => handleFeedback("negative")}
              className={`p-2 rounded-md transition-colors ${
                feedback === "negative"
                  ? "bg-[#2A2A2A] text-[#F44336]"
                  : "hover:bg-[#2A2A2A] text-[#A0A0A0] hover:text-[#ECECEC]"
              }`}
              title="Bad response"
            >
              <ThumbsDown size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
