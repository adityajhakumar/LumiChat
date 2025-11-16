"use client"

import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/lib/types"

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  model: string
  created_at: string
  updated_at: string
}

export async function saveChatToSupabase(
  title: string,
  messages: Message[],
  model: string
): Promise<ChatSession | null> {
  try {
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[LumiChat] No user logged in for saving chat")
      return null
    }

    console.log("[LumiChat] 💾 Saving new chat:", { 
      title, 
      messageCount: messages.length, 
      model,
      userId: user.id 
    })

    // Clean messages - remove any undefined or null values
    const cleanMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      ...(msg.image && { image: msg.image }),
      ...(msg.images && msg.images.length > 0 && { images: msg.images })
    }))

    const { data, error } = await supabase
      .from("chat_histories")
      .insert({
        user_id: user.id,
        title: title || "Untitled Chat",
        messages: cleanMessages, // Supabase handles JSONB automatically
        model: model,
      })
      .select()
      .single()

    if (error) {
      console.error("[LumiChat] ❌ Error saving chat:", error)
      return null
    }

    console.log("[LumiChat] ✅ Chat saved successfully:", data.id)
    return data as ChatSession
  } catch (error) {
    console.error("[LumiChat] ❌ Exception in saveChatToSupabase:", error)
    return null
  }
}

export async function updateChatInSupabase(
  chatId: string,
  messages: Message[],
  title?: string
): Promise<ChatSession | null> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[LumiChat] No user logged in for updating chat")
      return null
    }

    console.log("[LumiChat] 🔄 Updating chat:", { 
      chatId, 
      messageCount: messages.length,
      title 
    })

    // Clean messages
    const cleanMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      ...(msg.image && { image: msg.image }),
      ...(msg.images && msg.images.length > 0 && { images: msg.images })
    }))

    const updateData: any = {
      messages: cleanMessages,
      updated_at: new Date().toISOString(),
    }

    if (title) {
      updateData.title = title
    }

    const { data, error } = await supabase
      .from("chat_histories")
      .update(updateData)
      .eq("id", chatId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[LumiChat] ❌ Error updating chat:", error)
      return null
    }

    console.log("[LumiChat] ✅ Chat updated successfully")
    return data as ChatSession
  } catch (error) {
    console.error("[LumiChat] ❌ Exception in updateChatInSupabase:", error)
    return null
  }
}

export async function getChatHistory(): Promise<ChatSession[]> {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[LumiChat] No user logged in for fetching chat history")
      return []
    }

    console.log("[LumiChat] 📂 Fetching chat history for user:", user.id)

    const { data, error } = await supabase
      .from("chat_histories")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("[LumiChat] ❌ Error fetching chat history:", error)
      return []
    }

    console.log("[LumiChat] ✅ Loaded chats:", data?.length || 0)
    
    if (data && data.length > 0) {
      console.log("[LumiChat] 📊 Sample chat:", {
        id: data[0].id,
        title: data[0].title,
        messageCount: Array.isArray(data[0].messages) ? data[0].messages.length : 'N/A',
        created: data[0].created_at
      })
    }

    // Supabase automatically parses JSONB, no need to JSON.parse
    return (data || []) as ChatSession[]
  } catch (error) {
    console.error("[LumiChat] ❌ Exception in getChatHistory:", error)
    return []
  }
}

export async function getChatById(chatId: string): Promise<ChatSession | null> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[LumiChat] No user logged in for fetching chat")
      return null
    }

    console.log("[LumiChat] 🔍 Fetching chat by ID:", chatId)

    const { data, error } = await supabase
      .from("chat_histories")
      .select("*")
      .eq("id", chatId)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("[LumiChat] ❌ Error fetching chat:", error)
      return null
    }

    console.log("[LumiChat] ✅ Chat loaded:", data.id)
    return data as ChatSession
  } catch (error) {
    console.error("[LumiChat] ❌ Exception in getChatById:", error)
    return null
  }
}

export async function deleteChatFromSupabase(chatId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[LumiChat] No user logged in for deleting chat")
      return false
    }

    console.log("[LumiChat] 🗑️ Deleting chat:", chatId)

    const { error } = await supabase
      .from("chat_histories")
      .delete()
      .eq("id", chatId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[LumiChat] ❌ Error deleting chat:", error)
      return false
    }

    console.log("[LumiChat] ✅ Chat deleted successfully")
    return true
  } catch (error) {
    console.error("[LumiChat] ❌ Exception in deleteChatFromSupabase:", error)
    return false
  }
}
