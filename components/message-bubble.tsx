"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Copy, RotateCw, ThumbsUp, ThumbsDown, Check, Edit2, MessageSquare, ChevronDown, ChevronRight, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"

interface Thread {
  id: string
  parentText: string
  messages: Array<{ role: string; content: string }>
  collapsed: boolean
  insertPosition: number
  anchorPosition: { top: number; left: number }
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
  onClose,
  anchorPosition
}: { 
  thread: Thread
  onToggle: () => void
  onReply: (message: string) => Promise<void>
  onClose: () => void
  anchorPosition: { top: number; left: number }
}) {
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const threadBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!thread.collapsed && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [thread.collapsed])

  const handleSendReply = async () => {
    if (!replyText.trim()) return
    
    setLoading(true)
    await onReply(replyText)
    setReplyText("")
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSendReply()
    }
  }

  // Calculate positions for the connector line and thread box
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
  
  // Get the thread box position (fixed to right edge)
  const threadBoxRightEdge = viewportWidth - 20 // 20px from right edge
  const threadBoxWidth = thread.collapsed ? 280 : 380
  const threadBoxLeft = threadBoxRightEdge - threadBoxWidth
  
  const lineStartX = anchorPosition.left
  const lineStartY = anchorPosition.top
  const lineEndX = threadBoxLeft - 10 // Point to left edge of thread box
  const lineEndY = anchorPosition.top + 20

  return (
    <>
      {/* Connector Line - SVG for smooth curved line */}
      <svg
        className="fixed pointer-events-none z-40"
        style={{
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <defs>
          <linearGradient id={`gradient-${thread.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CC785C" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#CC785C" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path
          d={`M ${lineStartX} ${lineStartY} C ${lineStartX + 100} ${lineStartY}, ${lineEndX - 100} ${lineEndY}, ${lineEndX} ${lineEndY}`}
          stroke={`url(#gradient-${thread.id})`}
          strokeWidth="2.5"
          fill="none"
          strokeDasharray={thread.collapsed ? "8,4" : "none"}
          className="transition-all duration-300"
        />
        {/* Connection point at start */}
        <circle
          cx={lineStartX}
          cy={lineStartY}
          r="4"
          fill="#CC785C"
          opacity="0.8"
        />
        {/* Arrowhead at end */}
        <polygon
          points={`${lineEndX},${lineEndY} ${lineEndX - 8},${lineEndY - 5} ${lineEndX - 8},${lineEndY + 5}`}
          fill="#CC785C"
          opacity="0.9"
        />
      </svg>

      {/* Thread Box - Floating on the right */}
      <div
        ref={threadBoxRef}
        className="fixed z-50 transition-all duration-300 ease-out"
        style={{
          right: '20px', // Fixed to right edge with padding
          top: `${anchorPosition.top - 20}px`,
          maxWidth: thread.collapsed ? '280px' : '380px',
          width: thread.collapsed ? '280px' : '380px',
        }}
      >
        <div className={`bg-[#1A1A1A] rounded-xl shadow-2xl border-2 border-[#CC785C]/60 overflow-hidden transition-all duration-300 backdrop-blur-sm ${
          thread.collapsed ? 'max-h-[140px]' : 'max-h-[70vh]'
        }`}>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#CC785C]/20 to-transparent border-b border-[#CC785C]/30">
            <button
              onClick={onToggle}
              className="flex items-center gap-2 text-sm text-white hover:text-[#CC785C] transition-colors flex-1"
            >
              {thread.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              <MessageSquare size={16} className="text-[#CC785C]" />
              <span className="font-medium">
                Thread ({thread.messages.length})
              </span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#2A2A2A] rounded-lg text-[#A0A0A0] hover:text-[#CC785C] transition-all"
              title="Close thread"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3 bg-[#1E1E1E] border-b border-[#2A2A2A]">
            <p className="text-xs text-[#A0A0A0] mb-1 font-medium">Discussing:</p>
            <p className="text-xs text-[#D4D4D4] italic line-clamp-2 leading-relaxed">
              "{thread.parentText}"
            </p>
          </div>

          {!thread.collapsed && (
            <div className="flex flex-col max-h-[440px]">
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[200px] max-h-[300px] bg-[#171717]">
                {thread.messages.length === 0 ? (
                  <div className="text-center text-[#6B6B6B] text-xs py-8">
                    Start a conversation about this section
                  </div>
                ) : (
                  thread.messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs ${
                        msg.role === 'user' 
                          ? 'bg-[#CC785C]/20 text-[#ECECEC] border border-[#CC785C]/30' 
                          : 'bg-[#252525] text-[#D4D4D4] border border-[#3A3A3A]'
                      }`}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }: any) => <p className="text-xs leading-relaxed" {...props} />,
                            code: ({ node, inline, children, ...props }: any) => {
                              return inline ? (
                                <code className="bg-[#2A2A2A] text-[#E69B8A] px-1 py-0.5 rounded text-[10px] font-mono" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className="text-[10px]" {...props}>{children}</code>
                              )
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                )}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#252525] rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-[#CC785C] rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-[#CC785C] rounded-full animate-bounce delay-100"></div>
                        <div className="w-1 h-1 bg-[#CC785C] rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#1E1E1E] border-t border-[#2A2A2A]">
                <Textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Reply... (Ctrl+Enter)"
                  className="min-h-[50px] max-h-[100px] bg-[#222222] border-[#3A3A3A] text-white placeholder-[#6B6B6B] text-xs resize-none focus:border-[#CC785C] focus:ring-1 focus:ring-[#CC785C]"
                  rows={2}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSendReply}
                    disabled={loading || !replyText.trim()}
                    className="px-3 py-1.5 bg-[#CC785C] hover:bg-[#B8674A] disabled:bg-[#6B6B65] disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all hover:scale-105"
                  >
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function ContentWithThreads({ 
  content, 
  threads,
  onToggle,
  onReply,
  onClose
}: {
  content: string
  threads: Thread[]
  onToggle: (id: string) => void
  onReply: (id: string, msg: string) => Promise<void>
  onClose: (id: string) => void
}) {
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={getMarkdownComponents()}
      >
        {content}
      </ReactMarkdown>

      {threads.map((thread) => (
        <ThreadSection
          key={thread.id}
          thread={thread}
          onToggle={() => onToggle(thread.id)}
          onReply={(msg) => onReply(thread.id, msg)}
          onClose={() => onClose(thread.id)}
          anchorPosition={thread.anchorPosition}
        />
      ))}
    </>
  )
}

function getMarkdownComponents() {
  return {
    table: ({ node, ...props }: any) => (
      <div className="overflow-x-auto my-6">
        <table className="min-w-full border-collapse border border-[#3A3A3A] rounded-lg" {...props} />
      </div>
    ),
    thead: ({ node, ...props }: any) => (
      <thead className="bg-[#2A2A2A]" {...props} />
    ),
    th: ({ node, ...props }: any) => (
      <th className="border border-[#3A3A3A] px-4 py-2 text-left font-semibold text-[#ECECEC]" {...props} />
    ),
    td: ({ node, ...props }: any) => (
      <td className="border border-[#3A3A3A] px-4 py-2 text-[#D4D4D4]" {...props} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr className="hover:bg-[#252525] transition-colors" {...props} />
    ),
    p: ({ node, ...props }: any) => (
      <p className="my-4 leading-7 text-[#ECECEC]" {...props} />
    ),
    h1: ({ node, ...props }: any) => (
      <h1 className="text-2xl font-semibold my-6 text-[#ECECEC]" {...props} />
    ),
    h2: ({ node, ...props }: any) => (
      <h2 className="text-xl font-semibold my-5 text-[#ECECEC]" {...props} />
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-semibold my-4 text-[#ECECEC]" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
      <ul className="my-4 ml-6 list-disc space-y-2 text-[#ECECEC]" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
      <ol className="my-4 ml-6 list-decimal space-y-2 text-[#ECECEC]" {...props} />
    ),
    li: ({ node, ...props }: any) => (
      <li className="my-1 leading-7" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-[#CC785C] pl-4 my-4 italic text-[#D4D4D4]" {...props} />
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      const isCodeBlock = !inline && className
      const language = className?.replace("language-", "") || "javascript"
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
  }
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
  const [selectionRange, setSelectionRange] = useState({ start: 0, end: 0 })
  const messageRef = useRef<HTMLDivElement>(null)

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

  const findTextPosition = (selectedText: string, range: Range): { start: number; end: number } => {
    if (!messageRef.current) {
      return { start: 0, end: 0 }
    }

    try {
      const walker = document.createTreeWalker(
        messageRef.current,
        NodeFilter.SHOW_TEXT,
        null
      )

      let currentPos = 0
      let node: Node | null
      let foundStart = -1
      let foundEnd = -1

      while ((node = walker.nextNode())) {
        const textContent = node.textContent || ''
        
        if (range.startContainer === node || range.startContainer.contains(node) || node.contains(range.startContainer)) {
          if (foundStart === -1) {
            if (range.startContainer === node) {
              foundStart = currentPos + range.startOffset
            } else if (node.contains(range.startContainer)) {
              foundStart = currentPos
            }
          }
        }

        if (range.endContainer === node || range.endContainer.contains(node) || node.contains(range.endContainer)) {
          if (range.endContainer === node) {
            foundEnd = currentPos + range.endOffset
          } else if (node.contains(range.endContainer)) {
            foundEnd = currentPos + textContent.length
          }
        }

        currentPos += textContent.length
      }

      if (foundStart === -1 || foundEnd === -1) {
        const index = message.content.indexOf(selectedText)
        if (index !== -1) {
          return { start: index, end: index + selectedText.length }
        }
        return { start: message.content.length, end: message.content.length }
      }

      return { start: foundStart, end: foundEnd }
    } catch (error) {
      console.error('Error finding text position:', error)
      const index = message.content.indexOf(selectedText)
      if (index !== -1) {
        return { start: index, end: index + selectedText.length }
      }
      return { start: message.content.length, end: message.content.length }
    }
  }

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (!messageRef.current || isUser) return
      
      setTimeout(() => {
        const selection = window.getSelection()
        const text = selection?.toString().trim()
        
        if (text && text.length > 10) {
          const range = selection?.getRangeAt(0)
          if (range && messageRef.current?.contains(range.commonAncestorContainer)) {
            const positions = findTextPosition(text, range)
            setSelectedText(text)
            setSelectionRange(positions)
            
            const rect = range.getBoundingClientRect()
            setButtonPosition({
              x: rect.right + 10,
              y: rect.top + window.scrollY
            })
            setShowThreadButton(true)
          } else {
            setShowThreadButton(false)
          }
        } else {
          setShowThreadButton(false)
        }
      }, 50)
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.thread-button')) {
        setShowThreadButton(false)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isUser, message.content])

  const handleCreateThread = () => {
    if (!selectedText) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    const newThread: Thread = {
      id: Date.now().toString(),
      parentText: selectedText,
      messages: [],
      collapsed: false,
      insertPosition: selectionRange.end,
      anchorPosition: {
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX
      }
    }

    setThreads([...threads, newThread])
    setShowThreadButton(false)
    setSelectedText("")
    window.getSelection()?.removeAllRanges()
  }

  const handleThreadReply = async (threadId: string, replyMessage: string) => {
    const thread = threads.find(t => t.id === threadId)
    if (!thread || !onThreadResponse) return

    const updatedThreads = threads.map(t => 
      t.id === threadId 
        ? { ...t, messages: [...t.messages, { role: 'user', content: replyMessage }] }
        : t
    )
    setThreads(updatedThreads)

    try {
      const aiResponse = await onThreadResponse(thread.parentText, replyMessage)
      
      const finalThreads = updatedThreads.map(t =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, { role: 'assistant', content: aiResponse }] }
          : t
      )
      setThreads(finalThreads)
    } catch (error) {
      console.error('Thread reply error:', error)
    }
  }

  const toggleThread = (threadId: string) => {
    setThreads(threads.map(t => 
      t.id === threadId ? { ...t, collapsed: !t.collapsed } : t
    ))
  }

  const closeThread = (threadId: string) => {
    setThreads(threads.filter(t => t.id !== threadId))
  }

  return (
    <div
      ref={messageRef}
      className={`flex ${
        isUser ? "justify-end" : "justify-start"
      } mb-6 sm:mb-8 px-4 sm:px-6 group relative`}
    >
      {showThreadButton && (
        <button
          onClick={handleCreateThread}
          className="thread-button fixed z-50 bg-[#CC785C] hover:bg-[#B8674A] text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105"
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
              <ContentWithThreads
                content={message.content}
                threads={threads}
                onToggle={toggleThread}
                onReply={handleThreadReply}
                onClose={closeThread}
              />
            </div>
          </div>

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
