"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import MessageBubble from "@/components/message-bubble"
import { ArrowLeft, ExternalLink } from "lucide-react"

export default function SharedChatPage() {
  const params = useParams()
  const router = useRouter()
  const shareId = params.id as string

  const [loading, setLoading] = useState(true)
  const [chatData, setChatData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSharedChat = async () => {
      try {
        const result = await window.storage.get(shareId, true)
        
        if (!result) {
          setError("This shared chat doesn't exist or has expired.")
          setLoading(false)
          return
        }

        const data = JSON.parse(result.value)
        setChatData(data)

        // Increment view count
        data.views = (data.views || 0) + 1
        await window.storage.set(shareId, JSON.stringify(data), true)
        
      } catch (err) {
        console.error("Error loading shared chat:", err)
        setError("Failed to load shared chat.")
      } finally {
        setLoading(false)
      }
    }

    if (shareId) {
      loadSharedChat()
    }
  }, [shareId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1E1E1E]">
        <div className="text-[#9B9B95]">Loading shared chat...</div>
      </div>
    )
  }

  if (error || !chatData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#1E1E1E] px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold text-[#E5E5E0] mb-3">Chat Not Found</h1>
          <p className="text-[#9B9B95] mb-6">{error || "This chat may have been deleted or the link is invalid."}</p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#CC785C] hover:bg-[#B8674A] text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            Go to LumiChat
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-[#1E1E1E] text-white">
      {/* Header */}
      <div className="border-b border-[#343434] bg-[#1A1A1A] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <a
            href="/"
            className="p-2 hover:bg-[#2A2A2A] rounded-md transition-colors text-[#9B9B95] hover:text-[#E5E5E0] flex-shrink-0"
            title="Go to LumiChat"
          >
            <ArrowLeft size={20} />
          </a>
          <div className="flex flex-col min-w-0">
            <div className="text-sm text-[#E5E5E0] truncate font-medium">
              {chatData.chatName}
            </div>
            <div className="text-xs text-[#6B6B65]">
              Shared conversation • {chatData.views || 0} views
            </div>
          </div>
        </div>
        <a
          href="/"
          className="px-3 py-1.5 bg-[#CC785C] hover:bg-[#B8674A] text-white rounded-lg text-sm font-medium flex items-center gap-2 flex-shrink-0"
        >
          <span className="hidden sm:inline">Try LumiChat</span>
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-2">
          {chatData.messages && chatData.messages.length > 0 ? (
            chatData.messages.map((msg: any, i: number) => (
              <MessageBubble key={i} message={msg} />
            ))
          ) : (
            <div className="text-center text-[#6B6B65] py-12">
              No messages in this conversation
            </div>
          )}
        </div>
      </div>

      {/* Footer Notice */}
      <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-3 text-center">
        <p className="text-xs text-[#6B6B65]">
          This is a shared conversation from{" "}
          <a href="/" className="text-[#CC785C] hover:underline">
            LumiChat
          </a>
          . Responses may contain inaccurate information.
        </p>
      </div>
    </div>
  )
}
