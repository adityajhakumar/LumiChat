"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Copy, RotateCw, ThumbsUp, ThumbsDown, Check, Edit2, MessageSquare, ChevronRight, X } from "lucide-react"
import "katex/dist/katex.min.css" // Add this line!
import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"

interface Thread {
  id: string
  parentText: string
  messages: Array<{ role: string; content: string }>
  collapsed: boolean
  insertPosition: number
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
  onClose
}: { 
  thread: Thread
  onToggle: () => void
  onReply: (message: string) => Promise<void>
  onClose: () => void
}) {
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  return (
    <div className="my-4 border-l-2 border-[#CC785C] pl-4 bg-[#1A1A1A] rounded-r-lg py-3 thread-section animate-in fade-in slide-in-from-left-2 duration-300">
      {/* Thread Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-xs text-[#A0A0A0] hover:text-[#ECECEC] transition-colors"
        >
          <div className={`transition-transform duration-200 ${thread.collapsed ? '' : 'rotate-90'}`}>
            <ChevronRight size={14} />
          </div>
          <MessageSquare size={14} className="text-[#CC785C]" />
          <span className="font-medium">
            Thread ({thread.messages.length} {thread.messages.length === 1 ? 'reply' : 'replies'})
          </span>
        </button>
        <button
          onClick={onClose}
          className="p-1 hover:bg-[#2A2A2A] rounded text-[#A0A0A0] hover:text-[#ECECEC] transition-all hover:rotate-90 duration-200"
          title="Close thread"
        >
          <X size={14} />
        </button>
      </div>

      {/* Context Badge */}
      <div className="mb-3 p-2 bg-[#252525] rounded-lg border border-[#3A3A3A] transition-colors hover:border-[#CC785C]/50">
        <span className="text-xs text-[#A0A0A0] block mb-1">Discussing:</span>
        <p className="text-xs text-[#D4D4D4] italic line-clamp-2">
          "{thread.parentText}"
        </p>
      </div>

      {/* Thread Content */}
      <div className={`overflow-hidden transition-all duration-300 ${
        thread.collapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
      }`}>
        <div className="space-y-3">
          {/* Messages */}
          {thread.messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm transition-all hover:shadow-md ${
                msg.role === 'user' 
                  ? 'bg-[#2C2C2C] text-[#ECECEC] hover:bg-[#333333]' 
                  : 'bg-[#252525] text-[#D4D4D4] border border-[#3A3A3A] hover:border-[#4A4A4A]'
              }`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ node, inline, children, ...props }: any) => {
                      return inline ? (
                        <code
                          className="bg-[#2A2A2A] text-[#E69B8A] px-1 py-0.5 rounded text-xs font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <code className="text-xs" {...props}>{children}</code>
                      )
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-in fade-in duration-200">
              <div className="bg-[#252525] rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 h-1.5 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Reply Input */}
          <div className="pt-2 border-t border-[#2A2A2A]">
            <Textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply to this thread... (Ctrl+Enter to send)"
              className="min-h-[60px] bg-[#222222] border-[#3A3A3A] text-white placeholder-[#6B6B6B] text-sm resize-none focus:border-[#CC785C] focus:ring-1 focus:ring-[#CC785C] transition-all"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={handleSendReply}
                disabled={loading || !replyText.trim()}
                className="px-3 py-1.5 bg-[#CC785C] hover:bg-[#B8674A] disabled:bg-[#6B6B65] disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium transition-all hover:shadow-lg active:scale-95"
              >
                {loading ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component to split content and insert threads at specific positions
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
  // Sort threads by position (earliest first)
  const sortedThreads = [...threads].sort((a, b) => a.insertPosition - b.insertPosition)
  
  if (sortedThreads.length === 0) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={getMarkdownComponents()}
      >
        {content}
      </ReactMarkdown>
    )
  }

  const parts: React.ReactElement[] = []
  let lastIndex = 0

  sortedThreads.forEach((thread, idx) => {
    let insertPos = thread.insertPosition
    
    // Check if we're inside a code block
    const beforeText = content.substring(0, insertPos)
    const afterText = content.substring(insertPos)
    
    // Count code block markers before and after the position
    const codeBlocksBefore = (beforeText.match(/```/g) || []).length
    const isInsideCodeBlock = codeBlocksBefore % 2 !== 0
    
    if (isInsideCodeBlock) {
      // Find the end of the current code block
      const codeBlockEnd = afterText.indexOf('```')
      if (codeBlockEnd !== -1) {
        insertPos = insertPos + codeBlockEnd + 3 // Move past the closing ```
        // Skip any whitespace after code block
        while (insertPos < content.length && /\s/.test(content[insertPos])) {
          insertPos++
        }
      }
    }
    
    // Add content up to and including the selected text
    const beforeContent = content.substring(lastIndex, insertPos)
    if (beforeContent) {
      parts.push(
        <div key={`content-${idx}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={getMarkdownComponents()}
          >
            {beforeContent}
          </ReactMarkdown>
        </div>
      )
    }

    // Add the thread immediately after the selected text
    parts.push(
      <ThreadSection
        key={thread.id}
        thread={thread}
        onToggle={() => onToggle(thread.id)}
        onReply={(msg) => onReply(thread.id, msg)}
        onClose={() => onClose(thread.id)}
      />
    )

    lastIndex = insertPos
  })

  // Add remaining content after last thread
  const remainingContent = content.substring(lastIndex)
  if (remainingContent) {
    parts.push(
      <div key="content-end">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={getMarkdownComponents()}
        >
          {remainingContent}
        </ReactMarkdown>
      </div>
    )
  }

  return <>{parts}</>
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

  // Find exact position of selected text in the original content using DOM position
  const findTextPosition = (selectedText: string, range: Range): { start: number; end: number } => {
    if (!messageRef.current) {
      return { start: 0, end: 0 }
    }

    try {
      // Get all text nodes in the message
      const walker = document.createTreeWalker(
        messageRef.current,
        NodeFilter.SHOW_TEXT,
        null
      )

      let currentPos = 0
      let node: Node | null
      let foundStart = -1
      let foundEnd = -1

      // Walk through all text nodes and find position
      while ((node = walker.nextNode())) {
        const textContent = node.textContent || ''
        
        // Check if this node contains the start of our selection
        if (range.startContainer === node || range.startContainer.contains(node) || node.contains(range.startContainer)) {
          if (foundStart === -1) {
            // Calculate offset based on range
            if (range.startContainer === node) {
              foundStart = currentPos + range.startOffset
            } else if (node.contains(range.startContainer)) {
              foundStart = currentPos
            }
          }
        }

        // Check if this node contains the end of our selection
        if (range.endContainer === node || range.endContainer.contains(node) || node.contains(range.endContainer)) {
          if (range.endContainer === node) {
            foundEnd = currentPos + range.endOffset
          } else if (node.contains(range.endContainer)) {
            foundEnd = currentPos + textContent.length
          }
        }

        currentPos += textContent.length
      }

      // Fallback: use indexOf if DOM position detection failed
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
      // Fallback to simple search
      const index = message.content.indexOf(selectedText)
      if (index !== -1) {
        return { start: index, end: index + selectedText.length }
      }
      return { start: message.content.length, end: message.content.length }
    }
  }

  // Handle text selection for threading
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
            const messageRect = messageRef.current.getBoundingClientRect()
            
            // Smart positioning: prefer right side, but check screen bounds
            let x = rect.right + 10
            let y = rect.top + window.scrollY
            
            // If button would go off screen, position to the left
            if (x + 150 > window.innerWidth) {
              x = rect.left - 150
            }
            
            // Ensure it's within the message bounds horizontally
            if (x < messageRect.left) {
              x = messageRect.left + 10
            }
            
            setButtonPosition({ x, y })
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
      if (!target.closest('.thread-button') && !target.closest('.thread-section')) {
        setShowThreadButton(false)
      }
    }

    const handleScroll = () => {
      setShowThreadButton(false)
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isUser, message.content])

  const handleCreateThread = () => {
    if (!selectedText) return

    const newThread: Thread = {
      id: Date.now().toString(),
      parentText: selectedText,
      messages: [],
      collapsed: false,
      insertPosition: selectionRange.end
    }

    setThreads([...threads, newThread])
    setShowThreadButton(false)
    setSelectedText("")
    
    // Smooth deselection with fade effect
    const selection = window.getSelection()
    if (selection) {
      setTimeout(() => selection.removeAllRanges(), 150)
    }
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
          className="thread-button fixed z-50 bg-[#CC785C] hover:bg-[#B8674A] text-white px-3 py-1.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-105 animate-in fade-in slide-in-from-top-2 duration-200"
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
