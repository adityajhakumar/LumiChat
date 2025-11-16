"use client"

import { createClient } from "@/lib/supabase/client"
import type { Message } from "@/components/chat-interface"

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
      console.error("[v0] No user logged in for saving chat")
      return null
    }

    const { data, error } = await supabase
      .from("chat_histories")
      .insert({
        user_id: user.id,
        title: title || "Untitled Chat",
        messages: messages,
        model: model,
      })
      .select()
      .single()

    if (error) {
      // If table doesn't exist, return null instead of throwing
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.warn('[v0] Chat history table not initialized yet - chat will be saved to browser storage only')
        return null
      }
      console.error("[v0] Error saving chat to Supabase:", error)
      return null
    }

    return data as ChatSession
  } catch (error) {
    console.error("[v0] Error in saveChatToSupabase:", error)
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
      console.error("[v0] No user logged in for updating chat")
      return null
    }

    const updateData: any = {
      messages: messages,
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
      console.error("[v0] Error updating chat in Supabase:", error)
      return null
    }

    return data as ChatSession
  } catch (error) {
    console.error("[v0] Error in updateChatInSupabase:", error)
    return null
  }
}

export async function getChatHistory(): Promise<ChatSession[]> {
  try {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[v0] No user logged in for fetching chat history")
      return []
    }

    const { data, error } = await supabase
      .from("chat_histories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array instead of throwing
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.log('[v0] Chat table not found - user may be accessing for the first time')
        return []
      }
      console.error("[v0] Error fetching chat history:", error)
      return []
    }

    return (data || []) as ChatSession[]
  } catch (error) {
    console.error("[v0] Error in getChatHistory:", error)
    return []
  }
}

export async function getChatById(chatId: string): Promise<ChatSession | null> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[v0] No user logged in for fetching chat")
      return null
    }

    const { data, error } = await supabase
      .from("chat_histories")
      .select("*")
      .eq("id", chatId)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("[v0] Error fetching chat:", error)
      return null
    }

    return data as ChatSession
  } catch (error) {
    console.error("[v0] Error in getChatById:", error)
    return null
  }
}

export async function deleteChatFromSupabase(chatId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error("[v0] No user logged in for deleting chat")
      return false
    }

    const { error } = await supabase
      .from("chat_histories")
      .delete()
      .eq("id", chatId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[v0] Error deleting chat:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error in deleteChatFromSupabase:", error)
    return false
  }
}
