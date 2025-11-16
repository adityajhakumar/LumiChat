export interface Message {
  role: string
  content: string
  image?: string
  images?: string[]
  timestamp?: Date
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  model: string
  created_at: string
  updated_at: string
  user_id?: string
}
