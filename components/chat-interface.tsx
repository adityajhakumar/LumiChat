"use client"

import type React from "react"
import QuizMode from "./quiz-mode"
import { FileText, X, ArrowUp } from "lucide-react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import MessageBubble from "./message-bubble"
import ImageUpload from "./image-upload"
import VoiceInput from "./voice-input"
import CodeEditor from "./code-editor"
import LessonCard from "./lesson-card"
import { GripVertical } from "lucide-react"
import FileUpload from "./file-upload"
import ModelSelector from "./model-selector"

interface ChatInterfaceProps {
  selectedModel: string
  onModelChange: (model: string) => void
  onTokenCountChange: (count: number) => void
  messages: Array<{ role: string; content: string }>
  onMessagesChange: (messages: Array<{ role: string; content: string }>) => void
  studyMode?: boolean
  onStudyModeComplete?: () => void
  currentStudySession?: any
}

export default function ChatInterface({
  selectedModel,
  onModelChange,
  onTokenCountChange,
  messages,
  onMessagesChange,
  studyMode = false,
  onStudyModeComplete,
  currentStudySession,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [attachedFile, setAttachedFile] = useState<{ content: string; name: string } | null>(null)
  const [codeLanguage, setCodeLanguage] = useState("python")
  const [lessonSteps, setLessonSteps] = useState<any[]>([])
  const [followUpInput, setFollowUpInput] = useState("")
  const [dividerPos, setDividerPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [quizData, setQuizData] = useState<any>(null)
  const [currentTopic, setCurrentTopic] = useState("")
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)
  const [editedContent, setEditedContent] = useState("")
  const [userScrolled, setUserScrolled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentStudySession?.lessonSteps) {
      setLessonSteps(currentStudySession.lessonSteps)
      setCurrentTopic(currentStudySession.question)
    }
  }, [currentStudySession])

  // Smart scroll behavior - improved
  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current || !messagesEndRef.current) return
    
    const container = messagesContainerRef.current
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200
    
    // Only auto-scroll if user is near bottom OR force is true (new message sent)
    if (force || isNearBottom || !userScrolled) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      })
      setUserScrolled(false)
    }
  }

  // Detect user manual scrolling
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200
        setUserScrolled(!isAtBottom)
      }, 150)
    }

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      container.removeEventListener("scroll", handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  // Auto-scroll only when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100)
    }
  }, [messages.length])

  // --- Paste Image Support ---
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!event.clipboardData) return
      const items = event.clipboardData.items
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => setAttachedImage(e.target?.result as string)
            reader.readAsDataURL(file)
          }
        }
      }
    }
    textareaRef.current?.addEventListener("paste", handlePaste)
    return () => textareaRef.current?.removeEventListener("paste", handlePaste)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const container = containerRef.current
      const rect = container.getBoundingClientRect()
      const newPos = ((e.clientX - rect.left) / rect.width) * 100

      if (newPos > 30 && newPos < 70) {
        setDividerPos(newPos)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const handleFileSelect = (content: string, fileName: string) => {
    setAttachedFile({ content, name: fileName })
    setInput(
      (prev) =>
        prev +
        `\n\n[File attached: ${fileName}]\n\`\`\`\n${content.substring(0, 500)}${content.length > 500 ? "..." : ""}\n\`\`\``,
    )
  }

  const sendMessageToAPI = async (messagesToSend: Array<{ role: string; content: string }>) => {
    setLoading(true)
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesToSend,
          model: selectedModel,
          image: attachedImage,
          file: attachedFile,
          studyMode: studyMode,
        }),
      })
      const data = await response.json()
      if (data.error) {
        console.error(data.error)
        return null
      }
      return data
    } catch (err) {
      console.error(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() && !attachedImage && !attachedFile) return
    const userMessage = { role: "user", content: input }
    const newMessages = [...messages, userMessage]

    if (!studyMode) {
      onMessagesChange(newMessages)
    }

    if (studyMode && input.trim()) {
      setCurrentTopic(input)
    }

    setInput("")
    setAttachedImage(null)
    setAttachedFile(null)

    // Force scroll after sending message
    setTimeout(() => scrollToBottom(true), 100)

    const data = await sendMessageToAPI(newMessages)
    if (!data) return

    if (studyMode) {
      if (data.lessonSteps) {
        setLessonSteps(data.lessonSteps)
        const studySession = {
          id: Date.now().toString(),
          question: currentTopic || input,
          lessonSteps: data.lessonSteps,
          model: selectedModel,
          timestamp: Date.now(),
        }
        const saved = localStorage.getItem("mmchat_study_sessions")
        const sessions = saved ? JSON.parse(saved) : []
        localStorage.setItem("mmchat_study_sessions", JSON.stringify([studySession, ...sessions]))
      }
    } else {
      const assistantMessage = { 
        role: "assistant", 
        content: data.content
      }
      onMessagesChange([...newMessages, assistantMessage])
    }

    onTokenCountChange(data.tokenCount || 0)
    
    // Force scroll after receiving response
    setTimeout(() => scrollToBottom(true), 100)
  }

  const handleEditMessage = (index: number) => {
    setEditingMessageIndex(index)
    setEditedContent(messages[index].content)
  }

  const handleSaveEdit = async () => {
    if (editingMessageIndex === null) return
    
    const updatedMessages = [...messages]
    updatedMessages[editingMessageIndex] = {
      ...updatedMessages[editingMessageIndex],
      content: editedContent
    }
    
    const messagesToKeep = updatedMessages.slice(0, editingMessageIndex + 1)
    onMessagesChange(messagesToKeep)
    
    setEditingMessageIndex(null)
    setEditedContent("")
    
    const data = await sendMessageToAPI(messagesToKeep)
    if (!data) return
    
    const assistantMessage = { 
      role: "assistant", 
      content: data.content
    }
    onMessagesChange([...messagesToKeep, assistantMessage])
    onTokenCountChange(data.tokenCount || 0)
    
    setTimeout(() => scrollToBottom(true), 100)
  }

  const handleCancelEdit = () => {
    setEditingMessageIndex(null)
    setEditedContent("")
  }

  const handleRegenerateResponse = async (index: number) => {
    const messagesToKeep = messages.slice(0, index)
    onMessagesChange(messagesToKeep)
    
    const data = await sendMessageToAPI(messagesToKeep)
    if (!data) return
    
    const assistantMessage = { 
      role: "assistant", 
      content: data.content
    }
    onMessagesChange([...messagesToKeep, assistantMessage])
    onTokenCountChange(data.tokenCount || 0)
    
    setTimeout(() => scrollToBottom(true), 100)
  }

  // Handler for threaded responses
  const handleThreadResponse = async (parentText: string, userMessage: string): Promise<string> => {
    try {
      const threadMessages = [
        { 
          role: "system", 
          content: `The user is asking a follow-up question about this specific part of your previous response: "${parentText}". Please provide a focused answer that directly addresses their question in the context of this excerpt.` 
        },
        { role: "user", content: userMessage }
      ]

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, ...threadMessages],
          model: selectedModel,
          studyMode: false,
        }),
      })

      const data = await response.json()
      
      if (data.error) {
        console.error(data.error)
        return "Sorry, I couldn't generate a response. Please try again."
      }

      onTokenCountChange(data.tokenCount || 0)
      return data.content || "Sorry, I couldn't generate a response."
    } catch (err) {
      console.error("Thread response error:", err)
      return "Sorry, an error occurred. Please try again."
    }
  }

  const handleFollowUpQuestion = async () => {
    if (!followUpInput.trim()) return

    const userMessage = { role: "user", content: followUpInput }
    const newMessages = [...messages, userMessage]
    setFollowUpInput("")

    const data = await sendMessageToAPI(newMessages)
    if (!data) return

    if (data.lessonSteps) {
      setLessonSteps(data.lessonSteps)
    }
    onTokenCountChange(data.tokenCount || 0)
  }

  const handleCodeFeedback = async (code: string) => {
    if (!code.trim()) return

    const feedbackPrompt = `Please review this code and provide feedback on:
1. Correctness - Does it solve the problem?
2. Efficiency - Can it be optimized?
3. Style - Is it readable and well-structured?
4. Best Practices - Does it follow coding conventions?

Code to review:
\`\`\`
${code}
\`\`\`

Provide constructive feedback and suggestions for improvement.`

    const userMessage = { role: "user", content: feedbackPrompt }
    const newMessages = [...messages, userMessage]
    setFollowUpInput("")

    const data = await sendMessageToAPI(newMessages)
    if (!data) return

    if (data.lessonSteps) {
      setLessonSteps(data.lessonSteps)
    }
    onTokenCountChange(data.tokenCount || 0)
  }

  const handleStartQuiz = async (numQuestions: number) => {
    const lessonContent = lessonSteps.map((step) => `${step.title}: ${step.content}`).join("\n\n")

    const quizPrompt = `Based on the following lesson about "${currentTopic}", generate ${numQuestions} multiple choice questions to test understanding.

Lesson Content:
${lessonContent}

For each question, provide:
1. The question text (specific to the concepts taught)
2. Four options (A, B, C, D)
3. The correct answer (0-3 for option index)
4. A brief explanation of why the answer is correct

Format as JSON with this structure:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explanation": "..."
    }
  ]
}`

    const userMessage = { role: "user", content: quizPrompt }
    const newMessages = [...messages, userMessage]

    const data = await sendMessageToAPI(newMessages)
    if (!data) return

    try {
      const jsonMatch = data.content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsedQuiz = JSON.parse(jsonMatch[0])
        setQuizData(parsedQuiz)
        setQuizMode(true)
      }
    } catch (e) {
      console.error("Failed to parse quiz data:", e)
    }

    onTokenCountChange(data.tokenCount || 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) handleSendMessage()
  }

  const handleFollowUpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) handleFollowUpQuestion()
  }

  const handleLessonComplete = () => {
    setLessonSteps([])
    setInput("")
    onStudyModeComplete?.()
  }

  const handleQuizComplete = () => {
    setQuizMode(false)
    setQuizData(null)
  }

  if (studyMode) {
    return (
      <div ref={containerRef} className="flex h-full bg-[#1E1E1E] text-white overflow-hidden">
        {/* Left side - Lessons or Quiz */}
        <div style={{ width: `${dividerPos}%` }} className="flex flex-col overflow-hidden border-r border-[#2E2E2E]">
          {quizMode && quizData ? (
            <QuizMode quizData={quizData} onComplete={handleQuizComplete} topic={currentTopic} />
          ) : lessonSteps.length > 0 ? (
            <>
              <LessonCard steps={lessonSteps} onComplete={handleLessonComplete} onCodeFeedback={handleCodeFeedback} />
              <div className="border-t border-[#2E2E2E] bg-[#171717] p-3 md:p-4 flex-shrink-0">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#6B6B65] uppercase">Ask a follow-up question</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={followUpInput}
                      onChange={(e) => setFollowUpInput(e.target.value)}
                      onKeyDown={handleFollowUpKeyDown}
                      placeholder="Ask about this concept..."
                      className="flex-1 px-3 py-2 rounded-lg bg-[#222222] text-white placeholder-[#6B6B6B] border border-[#2E2E2E] focus:border-[#CC785C] focus:ring-1 focus:ring-[#CC785C] text-sm"
                    />
                    <button
                      onClick={handleFollowUpQuestion}
                      disabled={loading || !followUpInput.trim()}
                      className="px-3 md:px-4 py-2 rounded-lg bg-[#CC785C] hover:bg-[#B8674A] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex-shrink-0"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Initial prompt area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
                <div className="flex items-center justify-center h-full text-center px-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-2">Start Learning</h3>
                    <p className="text-sm md:text-base text-[#8C8C8C]">
                      Ask a coding question to begin your interactive lesson
                    </p>
                  </div>
                </div>
              </div>

              {/* Input for initial question */}
              <div className="border-t border-[#2E2E2E] bg-[#171717] p-3 md:p-6 flex-shrink-0">
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                  <div className="flex-1">
                    <Textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask a coding question..."
                      className="resize-none border-[#2E2E2E] bg-[#222222] text-white placeholder-[#6B6B6B] focus:ring-2 focus:ring-[#CC785C] rounded-lg text-sm md:text-base"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-[#CC785C] hover:bg-[#B8674A] text-white rounded-lg px-4 md:px-6 py-2 md:py-3 h-auto md:self-end w-full md:w-auto"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div
          onMouseDown={() => setIsDragging(true)}
          className="w-1 bg-[#2E2E2E] hover:bg-[#CC785C] cursor-col-resize transition-colors flex items-center justify-center group"
        >
          <GripVertical
            size={16}
            className="text-[#6B6B65] group-hover:text-[#CC785C] opacity-0 group-hover:opacity-100"
          />
        </div>

        {/* Right side - Code Editor */}
        <div style={{ width: `${100 - dividerPos}%` }} className="flex flex-col overflow-hidden">
          <CodeEditor
            language={codeLanguage}
            onLanguageChange={setCodeLanguage}
            onCodeFeedback={handleCodeFeedback}
            onStartQuiz={handleStartQuiz}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-white overflow-hidden">
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center min-h-full text-center px-4">
            <div className="flex flex-col items-center justify-center gap-2 md:gap-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#CC785C] tracking-tight">LumiChat</h1>
              <p className="text-sm sm:text-base md:text-lg text-[#9B9B95] font-light">Where your words matter</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i}>
                {editingMessageIndex === i ? (
                  <div className="mb-6 sm:mb-8">
                    <div className="w-full">
                      <Textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full min-h-[100px] bg-[#2A2A2A] border border-[#3A3A3A] text-white rounded-lg p-3"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-[#CC785C] hover:bg-[#B8674A] text-white rounded-lg text-sm"
                        >
                          Save & Submit
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <MessageBubble
                    message={msg}
                    onEdit={msg.role === "user" ? () => handleEditMessage(i) : undefined}
                    onRegenerate={msg.role === "assistant" ? () => handleRegenerateResponse(i) : undefined}
                    onThreadResponse={msg.role === "assistant" ? handleThreadResponse : undefined}
                  />
                )}
              </div>
            ))}
            {loading && (
              <div className="mb-4">
                <div className="bg-[#2A2A2A] rounded-xl px-4 py-3 inline-block">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
        </div>
      </div>

      {/* Scroll to Bottom Button - Shows when user scrolled up */}
      {userScrolled && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={() => scrollToBottom(true)}
            className="bg-[#2A2A2A] hover:bg-[#3A3A3A] border border-[#3A3A3A] text-white rounded-full p-2 shadow-lg transition-all"
            title="Scroll to bottom"
          >
            <ArrowUp className="rotate-180" size={20} />
          </button>
        </div>
      )}

      {/* Input - Claude Style - Mobile Optimized */}
      <div className="bg-[#1E1E1E] px-3 sm:px-4 pb-4 sm:pb-6 pt-3 sm:pt-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Model Selector - Mobile Only */}
          <div className="sm:hidden mb-3">
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelChange={onModelChange}
              hasImage={!!attachedImage}
            />
          </div>

          {/* Attached Files Preview */}
          {attachedImage && (
            <div className="mb-2 sm:mb-3 relative inline-block">
              <img
                src={attachedImage || "/placeholder.svg"}
                alt="Attached"
                className="h-16 sm:h-20 rounded-lg border border-[#3A3A3A] object-cover"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-2 -right-2 bg-[#D65D5D] text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 transition text-xs"
              >
                ✕
              </button>
            </div>
          )}
          {attachedFile && (
            <div className="mb-2 sm:mb-3 p-2 sm:p-3 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} className="text-[#CC785C] flex-shrink-0" />
                <span className="text-xs sm:text-sm text-[#9B9B95] truncate">{attachedFile.name}</span>
              </div>
              <button
                onClick={() => setAttachedFile(null)}
                className="ml-2 text-[#6B6B65] hover:text-[#D65D5D] transition flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          {/* Input Container - Mobile Optimized */}
          <div className="relative bg-[#2A2A2A] rounded-2xl sm:rounded-3xl border border-[#3A3A3A] focus-within:border-[#4A4A4A] transition-colors shadow-lg">
            {/* Attachment buttons - LEFT Side */}
            <div className="absolute left-3 sm:left-4 bottom-[14px] sm:bottom-4 flex items-center gap-1 z-10">
              <ImageUpload onImageSelect={setAttachedImage} />
              <FileUpload onFileSelect={handleFileSelect} />
              <VoiceInput onTranscript={(text) => setInput((prev) => prev + text)} />
            </div>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message"
              className="resize-none bg-transparent border-0 text-white placeholder-[#6B6B6B] focus:ring-0 rounded-2xl sm:rounded-3xl text-[15px] pl-[120px] sm:pl-32 pr-[60px] sm:pr-32 py-[18px] sm:py-5 w-full leading-6"
              rows={1}
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            
            {/* Model Selector + Send Button - RIGHT Side */}
            <div className="absolute right-3 sm:right-4 bottom-[14px] sm:bottom-4 flex items-center gap-2">
              {/* Model Selector - Desktop */}
              <div className="hidden sm:block">
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onModelChange={onModelChange}
                  hasImage={!!attachedImage}
                />
              </div>
              
              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={loading || (!input.trim() && !attachedImage && !attachedFile)}
                className="bg-[#CC785C] hover:bg-[#D68770] disabled:bg-[#6B6B65] disabled:cursor-not-allowed text-white rounded-lg sm:rounded-xl p-2 transition-all flex items-center justify-center flex-shrink-0"
                title="Send message"
              >
                <ArrowUp size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
