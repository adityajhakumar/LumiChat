"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from 'next/navigation'
import ChatInterface from "@/components/chat-interface"
import TokenCounter from "@/components/token-counter"
import ShareChat from "@/components/share-chat"
import DatabaseSetup from "@/components/database-setup"
import { Menu, MessageSquare, Trash2, BookOpen, Plus, Sparkles, X, LogOut } from 'lucide-react'
import LumiChatsLanding from "@/components/landing-page"
import { getChatHistory, deleteChatFromSupabase, saveChatToSupabase, updateChatInSupabase } from "@/lib/chat-persistence"

interface ChatSession {
  id: string
  name: string
  messages: Array<{ role: string; content: string }>
  model: string
  timestamp: number
  title?: string
}

interface StudySession {
  id: string
  question: string
  lessonSteps: any[]
  model: string
  timestamp: number
}

export default function Home() {
  // Add mounted state to prevent SSR issues
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  const [showLanding, setShowLanding] = useState(true)
  const [selectedModel, setSelectedModel] = useState("meta-llama/llama-4-maverick:free")
  const [tokenCount, setTokenCount] = useState(0)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [studyMode, setStudyMode] = useState(false)
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [showStudyHistory, setShowStudyHistory] = useState(false)
  const [currentStudySession, setCurrentStudySession] = useState<StudySession | null>(null)
  const [sessionsLoaded, setSessionsLoaded] = useState(false)
  const [isSavingChat, setIsSavingChat] = useState(false)
  const [dbError, setDbError] = useState(false)

  const sidebarRef = useRef<HTMLDivElement | null>(null)

  // MUST call useAuth unconditionally - hooks can't be conditional
  const { user, isLoading: authLoading, signOut } = useAuth()

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user has visited before OR if user is logged in
  useEffect(() => {
    if (!mounted) return
    
    const hasVisited = typeof window !== 'undefined' ? localStorage.getItem("lumichats_has_visited") : null
    
    if (user) {
      setShowLanding(false)
      setSessionsLoaded(false)
    } else if (hasVisited === "true") {
      setShowLanding(false)
    } else {
      setShowLanding(true)
    }
  }, [user, mounted])

  useEffect(() => {
    if (user && !authLoading && mounted) {
      loadChatsFromSupabase()
    }
  }, [user, authLoading, mounted])

  const loadChatsFromSupabase = async () => {
    try {
      const chats = await getChatHistory()
      const formattedChats = chats.map((chat) => ({
        id: chat.id,
        name: chat.title || "Untitled Chat",
        messages: Array.isArray(chat.messages) ? chat.messages : [],
        model: chat.model || "meta-llama/llama-4-maverick:free",
        timestamp: new Date(chat.updated_at).getTime(),
        title: chat.title,
      }))
      setChatSessions(formattedChats)
      setSessionsLoaded(true)
      setDbError(false)
    } catch (error) {
      console.error("Error loading chats from Supabase:", error)
      setDbError(true)
      setSessionsLoaded(true)
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || showLanding || !mounted) return
    try {
      const saved = window.localStorage.getItem("mmchat_study_sessions")
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setStudySessions(parsed)
        }
      }
    } catch (err) {
      console.error("Failed to load study sessions:", err)
    }
  }, [showLanding, mounted])

  useEffect(() => {
    if (typeof window !== "undefined" && !showLanding && mounted) {
      window.localStorage.setItem("lumichats_sidebar_open", sidebarOpen.toString())
    }
  }, [sidebarOpen, showLanding, mounted])

  useEffect(() => {
    if (!user || !currentChatId || messages.length === 0 || isSavingChat || !mounted) return

    const saveTimer = setTimeout(async () => {
      setIsSavingChat(true)
      try {
        const chatSession = chatSessions.find((s) => s.id === currentChatId)
        if (chatSession) {
          const chatTitle = chatSession.name === "New chat" 
            ? (messages.find((m) => m.role === "user")?.content.substring(0, 50) || "Chat")
            : chatSession.name

          await updateChatInSupabase(currentChatId, messages, chatTitle)
          
          setChatSessions((prev) =>
            prev.map((session) =>
              session.id === currentChatId
                ? { ...session, name: chatTitle, messages, model: selectedModel, timestamp: Date.now() }
                : session
            )
          )
        }
      } catch (error) {
        console.error("Error saving chat:", error)
      } finally {
        setIsSavingChat(false)
      }
    }, 2000)

    return () => clearTimeout(saveTimer)
  }, [messages, currentChatId, user, selectedModel, chatSessions, isSavingChat, mounted])

  const handleEnterApp = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lumichats_has_visited", "true")
    }
    
    if (!user) {
      router.push("/auth/login")
    } else {
      setShowLanding(false)
    }
  }

  const handleNewChat = async () => {
    const newChatId = Date.now().toString()
    const newSession: ChatSession = {
      id: newChatId,
      name: "New chat",
      messages: [],
      model: selectedModel,
      timestamp: Date.now(),
    }
    
    if (user) {
      try {
        const saved = await saveChatToSupabase("New chat", [], selectedModel)
        if (saved) {
          newSession.id = saved.id
          setChatSessions((prev) => [newSession, ...prev])
          setCurrentChatId(saved.id)
        }
      } catch (error) {
        console.error("Error creating new chat:", error)
      }
    } else {
      setChatSessions((prev) => [newSession, ...prev])
      setCurrentChatId(newChatId)
    }
    
    setMessages([])
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const handleLoadChat = (chatId: string) => {
    const session = chatSessions.find((s) => s.id === chatId)
    if (session) {
      setCurrentChatId(chatId)
      setMessages(session.messages)
      setSelectedModel(session.model)
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    }
  }

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (user) {
      try {
        await deleteChatFromSupabase(chatId)
      } catch (error) {
        console.error("Error deleting chat:", error)
      }
    }
    
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
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setSidebarOpen(false)
      }
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth >= 768) return
      
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement
        const toggleButton = document.querySelector('[data-sidebar-toggle="true"]')
        if (toggleButton && (toggleButton === target || toggleButton.contains(target))) {
          return
        }
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [sidebarOpen])

  // Show loading while mounting or auth is loading
  if (!mounted || authLoading) {
    return (
      <main className="flex items-center justify-center h-screen bg-[#212121] text-[#E5E5E0]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC785C]"></div>
          <div>Loading...</div>
        </div>
      </main>
    )
  }

  if (dbError && user) {
    return <DatabaseSetup />
  }

  if (showLanding) {
    return <LumiChatsLanding onEnterApp={handleEnterApp} />
  }

  if (!user && !showLanding) {
    router.push("/auth/login")
    return (
      <main className="flex items-center justify-center h-screen bg-[#212121] text-[#E5E5E0]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC785C]"></div>
          <div>Redirecting to login...</div>
        </div>
      </main>
    )
  }

  // Main app interface (only shown when user is logged in)
  return (
    <main className="flex h-screen bg-background font-sans overflow-hidden antialiased">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed md:relative inset-y-0 left-0 z-50 ${
          sidebarOpen ? "translate-x-0 md:w-[260px]" : "-translate-x-full md:w-0"
        } w-[280px] h-full border-r border-[#2E2E2E] bg-[#171717] transition-all duration-300 ease-in-out flex flex-col overflow-hidden`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <h1 className="text-lg font-normal text-[#E5E5E0]" style={{ fontFamily: "serif" }}>
            LumiChat
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#9B9B95]"
            aria-label="Close sidebar"
          >
            <X size={20} />
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

        <div className="border-t border-[#2E2E2E] p-3 space-y-2">
          <div className="px-2 py-1 text-xs text-[#6B6B65] truncate">
            {user?.email}
          </div>
          <button
            onClick={async () => {
              await signOut()
              router.push("/auth/login")
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-[#E5E5E0] hover:bg-[#2A2A2A] rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#212121] transition-all duration-300 ease-in-out">
        <header className="border-b border-[#343434] bg-[#1A1A1A] px-3 md:px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-sidebar-toggle="true"
              className="p-2 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#9B9B95] hover:text-[#E5E5E0] flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="text-sm text-[#E5E5E0] truncate">
              {currentChatId ? chatSessions.find((s) => s.id === currentChatId)?.name : "LumiChat"}
            </div>
            {isSavingChat && (
              <div className="text-xs text-[#6B6B65] hidden sm:inline">Saving...</div>
            )}
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
