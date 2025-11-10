"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import ChatInterface from "@/components/chat-interface"
import TokenCounter from "@/components/token-counter"
import ShareChat from "@/components/share-chat"
import { Menu, MessageSquare, Trash2, BookOpen, Plus, Sparkles, MoreHorizontal } from "lucide-react"
import LumiChatsLanding from "@/components/landing-page"


interface ChatSession {
  id: string
  name: string
  messages: Array<{ role: string; content: string }>
  model: string
  timestamp: number
}

interface StudySession {
  id: string
  question: string
  lessonSteps: any[]
  model: string
  timestamp: number
}

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [selectedModel, setSelectedModel] = useState("meta-llama/llama-3.3-8b-instruct:free")
  const [tokenCount, setTokenCount] = useState(0)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [sidebarOpen, setSidebarOpen] = useState(false) // Default closed on mobile
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState(false)
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [showStudyHistory, setShowStudyHistory] = useState(false)
  const [currentStudySession, setCurrentStudySession] = useState<StudySession | null>(null)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)

  const sidebarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisited = window.localStorage.getItem("lumichats_has_visited")
      if (hasVisited === "true") {
        setShowLanding(false)
      }
    }
  }, [])

  const handleEnterApp = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lumichats_has_visited", "true")
    }
    setShowLanding(false)
  }

  useEffect(() => {
    if (typeof window === "undefined" || showLanding) return
    try {
      const saved = window.localStorage.getItem("mmchat_sessions")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setChatSessions(parsed)
        } else {
          console.warn("Invalid chat session format, clearing storage.")
          window.localStorage.removeItem("mmchat_sessions")
        }
      }
    } catch (err) {
      console.error("Failed to load chat sessions:", err)
      window.localStorage.removeItem("mmchat_sessions")
    } finally {
      setSessionsLoaded(true)
    }
  }, [showLanding])

  useEffect(() => {
    if (typeof window === "undefined" || showLanding) return
    try {
      const saved = window.localStorage.getItem("mmchat_study_sessions")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setStudySessions(parsed)
        } else {
          console.warn("Invalid study session format, clearing storage.")
          window.localStorage.removeItem("mmchat_study_sessions")
        }
      }
    } catch (err) {
      console.error("Failed to load study sessions:", err)
      window.localStorage.removeItem("mmchat_study_sessions")
    }
  }, [showLanding])

  useEffect(() => {
    if (typeof window !== "undefined" && !showLanding) {
      window.localStorage.setItem("mmchat_sessions", JSON.stringify(chatSessions))
    }
  }, [chatSessions, showLanding])

  useEffect(() => {
    if (!currentChatId || messages.length === 0) return

    setChatSessions((prev) =>
      prev.map((session) => {
        if (session.id !== currentChatId) return session

        let name = session.name
        if (name === "New chat") {
          const firstUserMsg = messages.find((m) => m.role === "user")
          if (firstUserMsg) {
            name = firstUserMsg.content.substring(0, 50).trim()
            if (firstUserMsg.content.length > 50) name += "..."
          }
        }

        return {
          ...session,
          name,
          messages,
          model: selectedModel,
          timestamp: Date.now(),
        }
      })
    )
  }, [messages, selectedModel, currentChatId])

  const handleNewChat = () => {
    const newChatId = Date.now().toString()
    const newSession: ChatSession = {
      id: newChatId,
      name: "New chat",
      messages: [],
      model: selectedModel,
      timestamp: Date.now(),
    }
    setChatSessions((prev) => [newSession, ...prev])
    setCurrentChatId(newChatId)
    setMessages([])
    setSidebarOpen(false)
  }

  const handleLoadChat = (chatId: string) => {
    const session = chatSessions.find((s) => s.id === chatId)
    if (session) {
      setCurrentChatId(chatId)
      setMessages(session.messages)
      setSelectedModel(session.model)
      setSidebarOpen(false)
    }
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChatSessions((prev) => prev.filter((s) => s.id !== chatId))
    if (currentChatId === chatId) {
      setMessages([])
      setCurrentChatId(null)
    }
  }

  const handleStudyModeComplete = () => {
    setStudyMode(false)
    setCurrentStudySession(null)
  }

  const handleLoadStudySession = (sessionId: string) => {
    const session = studySessions.find((s) => s.id === sessionId)
    if (session) {
      setCurrentStudySession(session)
      setStudyMode(true)
      setMessages([{ role: "user", content: session.question }])
      setSidebarOpen(false)
    }
  }

  const groupChatsByTime = (sessions: ChatSession[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const groups: { [key: string]: ChatSession[] } = {
      Today: [],
      Yesterday: [],
      "Previous 7 days": [],
      "Previous 30 days": [],
      Older: [],
    }

    sessions.forEach((session) => {
      const sessionDate = new Date(session.timestamp)
      if (sessionDate >= today) groups.Today.push(session)
      else if (sessionDate >= yesterday) groups.Yesterday.push(session)
      else if (sessionDate >= weekAgo) groups["Previous 7 days"].push(session)
      else if (sessionDate >= monthAgo) groups["Previous 30 days"].push(session)
      else groups.Older.push(session)
    })

    return groups
  }

  const chatGroups = groupChatsByTime(chatSessions)

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        if (!target.closest('button[aria-label="Toggle sidebar"]')) {
          setSidebarOpen(false)
        }
      }
    }

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [sidebarOpen])

  if (showLanding) {
    return <LumiChatsLanding onEnterApp={handleEnterApp} />
  }

  if (!sessionsLoaded) {
    return (
      <main className="flex items-center justify-center h-screen bg-[#212121] text-[#E5E5E0]">
        <div>Loading your chats...</div>
      </main>
    )
  }

  return (
    <main className="flex h-screen bg-background font-sans overflow-hidden antialiased">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile optimized */}
      <aside
        ref={sidebarRef}
        className={`fixed md:relative inset-y-0 left-0 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } w-[280px] md:w-[260px] h-full border-r border-[#2E2E2E] bg-[#171717] transition-transform duration-300 ease-in-out flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <h1 className="text-lg font-normal text-[#E5E5E0]" style={{ fontFamily: "serif" }}>
            LumiChat
          </h1>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#9B9B95]"
            aria-label="Close sidebar"
          >
            <Menu size={20} />
          </button>
        </div>

        <div className="px-3 pb-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-transparent hover:bg-[#2A2A2A] text-[#CC785C] transition-colors text-sm"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#CC785C] flex-shrink-0">
              <Plus size={18} strokeWidth={2.5} className="text-white" />
            </div>
            <span className="font-medium whitespace-nowrap">New chat</span>
          </button>
        </div>

        <div className="px-2 pb-1">
          <button
            onClick={() => setShowStudyHistory(false)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${
              !showStudyHistory ? "bg-[#2A2A2A] text-[#E5E5E0]" : "text-[#9B9B95] hover:bg-[#232323]"
            }`}
          >
            <MessageSquare size={18} className="flex-shrink-0" />
            <span className="whitespace-nowrap">Chats</span>
          </button>
          <button
            onClick={() => setShowStudyHistory(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all text-sm ${
              showStudyHistory ? "bg-[#2A2A2A] text-[#E5E5E0]" : "text-[#9B9B95] hover:bg-[#232323]"
            }`}
          >
            <Sparkles size={18} className="flex-shrink-0" />
            <span className="whitespace-nowrap">Study</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pt-2">
          {showStudyHistory ? (
            <div className="space-y-0.5">
              {studySessions.length > 0 ? (
                studySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`w-full rounded-md transition-all group flex items-center justify-between ${
                      currentStudySession?.id === session.id ? "bg-[#2A2A2A]" : "hover:bg-[#232323]"
                    }`}
                  >
                    <button
                      onClick={() => handleLoadStudySession(session.id)}
                      className="flex-1 text-left px-3 py-2.5 min-w-0"
                    >
                      <div className="text-sm text-[#E5E5E0] truncate">{session.question}</div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3A3A3A] rounded transition-all text-[#9B9B95] mr-2 flex-shrink-0"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-[#6B6B65] text-center py-8">No study sessions yet</div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(chatGroups).map(([period, sessions]) =>
                sessions.length > 0 ? (
                  <div key={period}>
                    <h2 className="text-xs font-medium text-[#6B6B65] px-3 pb-2 whitespace-nowrap">{period}</h2>
                    <div className="space-y-0.5">
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className={`w-full rounded-md transition-all group flex items-center justify-between ${
                            currentChatId === session.id ? "bg-[#2A2A2A]" : "hover:bg-[#232323]"
                          }`}
                        >
                          <button
                            onClick={() => handleLoadChat(session.id)}
                            className="flex-1 text-left px-3 py-2.5 min-w-0"
                          >
                            <div className="text-sm text-[#E5E5E0] truncate">{session.name}</div>
                          </button>
                          <button
                            onClick={(e) => handleDeleteChat(session.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#3A3A3A] rounded transition-all text-[#9B9B95] mr-2 flex-shrink-0"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
              {chatSessions.length === 0 && (
                <div className="text-sm text-[#6B6B65] text-center py-8">No chats yet</div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#212121]">
        {/* Header - Mobile optimized */}
        <header className="border-b border-[#343434] bg-[#1A1A1A] px-3 md:px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#9B9B95] hover:text-[#E5E5E0] flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="text-sm text-[#E5E5E0] truncate">
              {currentChatId ? chatSessions.find((s) => s.id === currentChatId)?.name : "LumiChat"}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentChatId && !studyMode && messages.length > 0 && (
              <ShareChat
                chatId={currentChatId}
                chatName={chatSessions.find((s) => s.id === currentChatId)?.name || "Chat"}
                messages={messages}
              />
            )}
            
            <button
              onClick={() => {
                setStudyMode(!studyMode)
                if (!studyMode) {
                  setCurrentStudySession(null)
                  setMessages([])
                }
              }}
              className={`px-2 md:px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 text-sm font-medium ${
                studyMode
                  ? "bg-[#CC785C] text-white"
                  : "bg-[#2A2A2A] text-[#9B9B95] hover:bg-[#343434] hover:text-[#E5E5E0]"
              }`}
            >
              <BookOpen size={16} className="flex-shrink-0" />
              <span className="hidden sm:inline">Study Mode</span>
              <span className="sm:hidden">Study</span>
            </button>
            
            <div className="hidden lg:block">
              <TokenCounter count={tokenCount} />
            </div>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            onTokenCountChange={setTokenCount}
            messages={messages}
            onMessagesChange={setMessages}
            studyMode={studyMode}
            onStudyModeComplete={handleStudyModeComplete}
            currentStudySession={currentStudySession}
          />
        </div>
      </div>
    </main>
  )
}
