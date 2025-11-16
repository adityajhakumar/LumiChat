"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getChatHistory, deleteChatFromSupabase } from "@/lib/chat-persistence"
import { Menu, Plus, LogOut, Trash2 } from 'lucide-react'
import Link from "next/link"

interface ChatSession {
  id: string
  title: string
  messages: any[]
  model: string
  created_at: string
  updated_at: string
}

interface ChatSidebarProps {
  onSelectChat?: (chatId: string) => void
  currentChatId?: string
  onNewChat?: () => void
}

export default function ChatSidebar({
  onSelectChat,
  currentChatId,
  onNewChat,
}: ChatSidebarProps) {
  const [chats, setChats] = useState<ChatSession[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (user) {
      loadChats()
    }
  }, [user])

  const loadChats = async () => {
    setIsLoading(true)
    const chatHistory = await getChatHistory()
    setChats(chatHistory)
    setIsLoading(false)
  }

  const handleDeleteChat = async (chatId: string) => {
    const success = await deleteChatFromSupabase(chatId)
    if (success) {
      setChats(chats.filter((chat) => chat.id !== chatId))
    }
  }

  const handleLogout = async () => {
    await signOut()
  }

  if (!user) return null

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A]"
      >
        <Menu size={20} className="text-[#E5E5E0]" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-[#171717] border-r border-[#2E2E2E] z-40 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2E2E2E]">
          <button
            onClick={() => {
              onNewChat?.()
              setIsOpen(false)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 bg-[#CC785C] hover:bg-[#D68770] text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-center text-[#6B6B65] text-sm">Loading...</div>
          ) : chats.length === 0 ? (
            <div className="text-center text-[#6B6B65] text-sm">No chats yet</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? "bg-[#2A2A2A]"
                    : "hover:bg-[#2A2A2A]"
                }`}
                onClick={() => {
                  onSelectChat?.(chat.id)
                  setIsOpen(false)
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#E5E5E0] truncate">
                      {chat.title}
                    </p>
                    <p className="text-xs text-[#6B6B65] mt-1">
                      {new Date(chat.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChat(chat.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#6B6B65] hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with user info and logout */}
        <div className="p-4 border-t border-[#2E2E2E]">
          <div className="mb-3 pb-3 border-b border-[#2E2E2E]">
            <p className="text-xs text-[#6B6B65] truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-[#E5E5E0] hover:bg-[#2A2A2A] rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
