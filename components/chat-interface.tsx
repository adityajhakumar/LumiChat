"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

// Icons
import { 
  FileText, 
  X, 
  ArrowUp, 
  Brain, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Image as ImageIcon, 
  FileUp, 
  Sparkles, 
  GripVertical 
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// Custom Components
import MessageBubble from "./message-bubble"
import ImageUpload from "./image-upload"
import VoiceInput from "./voice-input"
import StudyPDFInterface from "./study-pdf-interface"
import QuizMode from "./quiz-mode"
import LessonCard from "./lesson-card"
import FileUpload from "./file-upload"
import ModelSelector from "./model-selector"
import CodeEditor from "./code-editor"


// Updated Message interface with image support
interface Message {
  role: string
  content: string
  image?: string
  images?: string[]
}

interface ChatInterfaceProps {
  selectedModel: string
  onModelChange: (model: string) => void
  onTokenCountChange: (count: number) => void
  messages: Message[]
  onMessagesChange: (messages: Message[]) => void
  studyMode?: boolean
  onStudyModeComplete?: () => void
  currentStudySession?: any
}

type FallbackChains = {
  [key: string]: string[];
}

const MODEL_FALLBACK_CONFIG: {
  fallbackChains: FallbackChains;
  universalFallbacks: string[];
  maxRetries: number;
  retryDelay: number;
} = {
  fallbackChains: {
    "google/gemini-2.0-flash-exp:free": [
      "qwen/qwen2.5-vl-32b-instruct:free",
      "nvidia/nemotron-nano-12b-v2-vl:free",
      "google/gemma-3-27b-it:free"
    ],
    "qwen/qwen2.5-vl-32b-instruct:free": [
      "google/gemini-2.0-flash-exp:free",
      "nvidia/nemotron-nano-12b-v2-vl:free"
    ],
    "deepseek/deepseek-r1-distill-llama-70b:free": [
      "tngtech/deepseek-r1t2-chimera:free",
      "meta-llama/llama-3.3-70b-instruct:free"
    ],
    "qwen/qwen3-coder:free": [
      "mistralai/devstral-small-2505:free",
      "meta-llama/llama-3.3-70b-instruct:free"
    ]
  },
  universalFallbacks: [
    "meta-llama/llama-3.3-70b-instruct:free",
    "google/gemini-2.0-flash-exp:free",
    "google/gemma-3-27b-it:free",
    "qwen/qwen3-14b:free"
  ],
  maxRetries: 3,
  retryDelay: 500
};

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
  const [pdfImages, setPdfImages] = useState<string[]>([])
  const [fileContentSent, setFileContentSent] = useState(false)
  const [analyzingFile, setAnalyzingFile] = useState(false)
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
  const [useReasoning, setUseReasoning] = useState(false)
  const [reasoningEffort, setReasoningEffort] = useState<"low" | "medium" | "high">("medium")
  const [showReasoningPanel, setShowReasoningPanel] = useState(false)
  const [currentReasoning, setCurrentReasoning] = useState<string | null>(null)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const plusMenuRef = useRef<HTMLDivElement>(null)
  const [fallbackInfo, setFallbackInfo] = useState<{
    originalModel: string;
    usedModel: string;
    attempts: number;
  } | null>(null);
  const [retryStatus, setRetryStatus] = useState<{
    show: boolean;
    currentModel: string;
    attemptNumber: number;
    totalAttempts: number;
  }>({ show: false, currentModel: '', attemptNumber: 0, totalAttempts: 0 });

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (currentStudySession?.lessonSteps) {
      setLessonSteps(currentStudySession.lessonSteps)
      setCurrentTopic(currentStudySession.question)
    }
  }, [currentStudySession])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false)
      }
    }
    if (showPlusMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPlusMenu])

  const scrollToBottom = (force = false) => {
    if (!messagesContainerRef.current || !messagesEndRef.current) return
    const container = messagesContainerRef.current
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
    if (force || isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto", block: "end" })
      setUserScrolled(false)
    }
  }

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const handleScroll = () => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      if (!isAtBottom && !userScrolled) {
        setUserScrolled(true)
      } else if (isAtBottom && userScrolled) {
        setUserScrolled(false)
      }
    }
    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [userScrolled])

  useEffect(() => {
    if (messages.length > 0 && !userScrolled) {
      const timeoutId = setTimeout(() => scrollToBottom(true), 50)
      return () => clearTimeout(timeoutId)
    }
  }, [messages.length, userScrolled])

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
    setFileContentSent(false)
    if (!input.trim()) {
      setInput("Please analyze this document thoroughly and tell me what it contains.")
    }
  }

  const handlePdfImagesExtracted = (images: string[], fileName: string) => {
    setPdfImages(images)
  }

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fileName = file.name
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    if (fileExtension === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          setAttachedFile({ content: fileName, name: fileName })
          setFileContentSent(false)
          if (!input.trim()) {
            setInput("Please analyze this document thoroughly and tell me what it contains.")
          }
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error reading PDF:', error)
      }
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setAttachedFile({ content, name: fileName })
        setFileContentSent(false)
        if (!input.trim()) {
          setInput("Please analyze this document thoroughly and tell me what it contains.")
        }
      }
      reader.readAsText(file)
    }
  }

  const handleStreamResponse = async (
    response: Response,
    onChunk: (content: string) => void,
    onComplete: (data: { fullContent: string; reasoning?: string; lessonSteps?: any[] }) => void,
    onError: (error: string) => void
  ) => {
    const reader = response.body?.getReader()
    if (!reader) {
      onError('Response body is not readable')
      return
    }
    const decoder = new TextDecoder()
    let buffer = ''
    let fullContent = ''
    let reasoning = ''
    let lessonSteps: any[] | undefined
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        while (true) {
          const lineEnd = buffer.indexOf('\n')
          if (lineEnd === -1) break
          const line = buffer.slice(0, lineEnd).trim()
          buffer = buffer.slice(lineEnd + 1)
          if (!line || line.startsWith(':')) continue
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onComplete({ fullContent, reasoning: reasoning || undefined, lessonSteps })
              return
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.error) {
                onError(parsed.error.message || 'Stream error occurred')
                return
              }
              if (parsed.done) {
                fullContent = parsed.fullContent || fullContent
                reasoning = parsed.reasoning || reasoning
                lessonSteps = parsed.lessonSteps
                onComplete({ fullContent, reasoning: reasoning || undefined, lessonSteps })
                return
              }
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullContent += content
                onChunk(content)
              }
              const reasoningChunk = parsed.choices?.[0]?.delta?.reasoning
              if (reasoningChunk) {
                reasoning += reasoningChunk
              }
              if (parsed.choices?.[0]?.finish_reason === 'error') {
                onError('Generation stopped due to error')
                return
              }
            } catch (e) {
              console.warn('Failed to parse SSE chunk:', e)
            }
          }
        }
      }
    } catch (error: any) {
      onError(error.message || 'Streaming error occurred')
    } finally {
      reader.cancel()
    }
  }

  const sendMessageToAPIWithFallback = async (
    messagesToSend: Message[],
    includeFileContent = false,
    primaryModel: string,
    onStreamChunk?: (content: string) => void,
    analyzeFile = false
  ) => {
    const fallbackChain = MODEL_FALLBACK_CONFIG.fallbackChains[primaryModel] || MODEL_FALLBACK_CONFIG.universalFallbacks;
    const modelsToTry = [primaryModel, ...fallbackChain].slice(0, MODEL_FALLBACK_CONFIG.maxRetries + 1);
    const failedAttempts: Array<{ model: string; error: string }> = [];
    
    for (let i = 0; i < modelsToTry.length; i++) {
      const currentModel = modelsToTry[i];
      const isPrimary = i === 0;
      
      try {
        if (!isPrimary) {
          setRetryStatus({
            show: true,
            currentModel: currentModel,
            attemptNumber: i,
            totalAttempts: modelsToTry.length - 1
          });
          await new Promise(resolve => setTimeout(resolve, MODEL_FALLBACK_CONFIG.retryDelay));
        }
        
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messagesToSend,
            model: currentModel,
            image: attachedImage,
            images: pdfImages.length > 0 ? pdfImages : undefined,
            fileContent: includeFileContent && attachedFile?.content ? attachedFile.content : undefined,
            fileName: includeFileContent && attachedFile?.name ? attachedFile.name : undefined,
            studyMode: studyMode,
            useReasoning: useReasoning,
            reasoningEffort: reasoningEffort,
            stream: true,
            analyzeFile: analyzeFile,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        if (onStreamChunk && response.headers.get('content-type')?.includes('text/event-stream')) {
          return new Promise((resolve, reject) => {
            handleStreamResponse(
              response,
              onStreamChunk,
              (data) => {
                setRetryStatus({ show: false, currentModel: '', attemptNumber: 0, totalAttempts: 0 });
                resolve({
                  data: {
                    content: data.fullContent,
                    reasoning: data.reasoning,
                    lessonSteps: data.lessonSteps,
                    tokenCount: 0
                  },
                  usedModel: currentModel,
                  fallbackUsed: !isPrimary,
                  totalAttempts: i + 1
                });
              },
              (error) => {
                reject(new Error(error));
              }
            );
          });
        }

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (!data.content || data.content.trim() === '') {
          throw new Error('Empty response received');
        }
        setRetryStatus({ show: false, currentModel: '', attemptNumber: 0, totalAttempts: 0 });
        return {
          data,
          usedModel: currentModel,
          fallbackUsed: !isPrimary,
          totalAttempts: i + 1
        };
      } catch (err: any) {
        const errorMsg = err.message || 'Unknown error';
        console.error(`❌ Model ${currentModel} failed:`, errorMsg);
        failedAttempts.push({
          model: currentModel,
          error: errorMsg
        });
        if (i === modelsToTry.length - 1) {
          setRetryStatus({ show: false, currentModel: '', attemptNumber: 0, totalAttempts: 0 });
          console.error('💥 All models exhausted. Failed attempts:', failedAttempts);
          return null;
        }
      }
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !attachedImage && !attachedFile) return
    const shouldIncludeFile = attachedFile !== null && !fileContentSent
    
    // Show analysis indicator for files
    if (shouldIncludeFile) {
      setAnalyzingFile(true)
    }
    
    const userMessage: Message = { 
      role: "user", 
      content: input,
      image: attachedImage || undefined,
      images: pdfImages.length > 0 ? pdfImages : undefined
    }
    const newMessages = [...messages, userMessage]
    
    if (!studyMode) {
      onMessagesChange(newMessages)
    }
    if (studyMode && input.trim()) {
      setCurrentTopic(input)
    }
    setInput("")
    setAttachedImage(null)
    setPdfImages([])
    setFallbackInfo(null)
    setCurrentReasoning(null)
    setTimeout(() => scrollToBottom(true), 50)
    setLoading(true)
    
    const streamingMessage: Message = { role: "assistant", content: "" }
    const messagesWithStreaming = [...newMessages, streamingMessage]
    if (!studyMode) {
      onMessagesChange(messagesWithStreaming)
    }
    
    const handleChunk = (content: string) => {
      if (!studyMode) {
        messagesWithStreaming[messagesWithStreaming.length - 1].content += content
        onMessagesChange([...messagesWithStreaming])
        if (!userScrolled) {
          setTimeout(() => scrollToBottom(), 10)
        }
      }
    }
    
    const result = await sendMessageToAPIWithFallback(
      newMessages, 
      shouldIncludeFile, 
      selectedModel, 
      handleChunk,
      shouldIncludeFile
    ) as any
    
    setLoading(false)
    setAnalyzingFile(false)
    
    if (!result)  {
      const errorMessage: Message = {
        role: "assistant",
        content: `❌ **Unable to Generate Response**\n\nAll available models failed to respond.`
      }
      onMessagesChange([...newMessages, errorMessage])
      return
    }
    
    const data = result.data
    const usedModel = result.usedModel
    const fallbackUsed = result.fallbackUsed
    const totalAttempts = result.totalAttempts
    
    if (shouldIncludeFile) {
      setFileContentSent(true)
    }
    if (fallbackUsed) {
      setFallbackInfo({
        originalModel: selectedModel,
        usedModel: usedModel,
        attempts: totalAttempts - 1
      })
      setTimeout(() => setFallbackInfo(null), 6000)
    }
    if (data.reasoning) {
      setCurrentReasoning(data.reasoning)
      setShowReasoningPanel(true)
    }
    if (studyMode) {
      if (data.lessonSteps) {
        setLessonSteps(data.lessonSteps)
        const studySession = {
          id: Date.now().toString(),
          question: currentTopic || input,
          lessonSteps: data.lessonSteps,
          model: usedModel,
          timestamp: Date.now(),
        }
        const saved = localStorage.getItem("mmchat_study_sessions")
        const sessions = saved ? JSON.parse(saved) : []
        localStorage.setItem("mmchat_study_sessions", JSON.stringify([studySession, ...sessions]))
      }
    }
    onTokenCountChange(data.tokenCount || 0)
    setTimeout(() => scrollToBottom(true), 50)
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
    setLoading(true)
    const streamingMessage: Message = { role: "assistant", content: "" }
    const messagesWithStreaming = [...messagesToKeep, streamingMessage]
    onMessagesChange(messagesWithStreaming)
    const handleChunk = (content: string) => {
      messagesWithStreaming[messagesWithStreaming.length - 1].content += content
      onMessagesChange([...messagesWithStreaming])
      if (!userScrolled) {
        setTimeout(() => scrollToBottom(), 10)
      }
    }
    const result = await sendMessageToAPIWithFallback(messagesToKeep, false, selectedModel, handleChunk, false) as any
    setLoading(false)
    if (!result) return
    const data = result.data
    if (data.reasoning) {
      setCurrentReasoning(data.reasoning)
      setShowReasoningPanel(true)
    }
    onTokenCountChange(data.tokenCount || 0)
    setTimeout(() => scrollToBottom(true), 50)
  }

  const handleCancelEdit = () => {
    setEditingMessageIndex(null)
    setEditedContent("")
  }

  const handleRegenerateResponse = async (index: number) => {
    const messagesToKeep = messages.slice(0, index)
    onMessagesChange(messagesToKeep)
    setLoading(true)
    const streamingMessage: Message = { role: "assistant", content: "" }
    const messagesWithStreaming = [...messagesToKeep, streamingMessage]
    onMessagesChange(messagesWithStreaming)
    const handleChunk = (content: string) => {
      messagesWithStreaming[messagesWithStreaming.length - 1].content += content
      onMessagesChange([...messagesWithStreaming])
      if (!userScrolled) {
        setTimeout(() => scrollToBottom(), 10)
      }
    }
    const result = await sendMessageToAPIWithFallback(messagesToKeep, false, selectedModel, handleChunk, false) as any
    setLoading(false)
    if (!result) return
    const data = result.data
    if (data.reasoning) {
      setCurrentReasoning(data.reasoning)
      setShowReasoningPanel(true)
    }
    onTokenCountChange(data.tokenCount || 0)
    setTimeout(() => scrollToBottom(true), 50)
  }

  const handleThreadResponse = async (parentText: string, userMessage: string): Promise<string> => {
    try {
      const threadMessages: Message[] = [
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
          useReasoning: useReasoning,
          reasoningEffort: reasoningEffort,
          stream: false,
          analyzeFile: false,
        }),
      })
      const data = await response.json()
      if (data.error) {
        console.error(data.error)
        return "Sorry, I couldn't generate a response. Please try again."
      }
      if (data.reasoning) {
        setCurrentReasoning(data.reasoning)
        setShowReasoningPanel(true)
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
    const userMessage: Message = { role: "user", content: followUpInput }
    const newMessages = [...messages, userMessage]
    setFollowUpInput("")
    setLoading(true)
    const result = await sendMessageToAPIWithFallback(newMessages, false, selectedModel, undefined, false) as any
    setLoading(false)
    if (!result) return
    const data = result.data
    if (data.reasoning) {
      setCurrentReasoning(data.reasoning)
      setShowReasoningPanel(true)
    }
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
    const userMessage: Message = { role: "user", content: feedbackPrompt }
    const newMessages = [...messages, userMessage]
    setFollowUpInput("")
    setLoading(true)
    const result = await sendMessageToAPIWithFallback(newMessages, false, selectedModel, undefined, false) as any
    setLoading(false)
    if (!result)  return
    const data = result.data
    if (data.reasoning) {
      setCurrentReasoning(data.reasoning)
      setShowReasoningPanel(true)
    }
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
    const userMessage: Message = { role: "user", content: quizPrompt }
    const newMessages = [...messages, userMessage]
    setLoading(true)
    const result = await sendMessageToAPIWithFallback(newMessages, false, selectedModel, undefined, false) as any
    setLoading(false)
    if (!result)  return
    const data = result.data
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

  const supportsReasoning = 
    selectedModel.includes("minimax") || 
    selectedModel.includes("deepseek-r1") ||
    selectedModel.includes("reasoning") ||
    selectedModel.includes("tongyi-deepresearch") ||
    selectedModel.includes("qwq")

  const PlusMenu = () => {
    const handleImageClick = () => {
      imageInputRef.current?.click()
      setShowPlusMenu(false)
    }
    const handleFileClick = () => {
      fileInputRef.current?.click()
      setShowPlusMenu(false)
    }
    const handleThinkingToggle = () => {
      setUseReasoning(!useReasoning)
      setShowPlusMenu(false)
    }
    return (
      <div className="relative" ref={plusMenuRef}>
        <button
          onClick={() => setShowPlusMenu(!showPlusMenu)}
          className={`p-2 rounded-lg transition-all hover:bg-[#3A3A3A] ${showPlusMenu ? 'bg-[#3A3A3A]' : ''}`}
          title="More options"
        >
          <Plus size={20} className="text-[#9B9B95]" />
        </button>
        {showPlusMenu && (
          <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            <div className="py-2">
              <button
                onClick={handleImageClick}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3A3A3A] transition-colors text-left group"
              >
                <div className="p-2 rounded-lg bg-[#3A3A3A] group-hover:bg-[#4A4A4A] transition-colors">
                  <ImageIcon size={18} className="text-[#CC785C]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#E5E5E0]">Add image</div>
                  <div className="text-xs text-[#6B6B65]">Upload from device</div>
                </div>
              </button>
              <button
                onClick={handleFileClick}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3A3A3A] transition-colors text-left group"
              >
                <div className="p-2 rounded-lg bg-[#3A3A3A] group-hover:bg-[#4A4A4A] transition-colors">
                  <FileUp size={18} className="text-[#CC785C]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#E5E5E0]">Add file</div>
                  <div className="text-xs text-[#6B6B65]">PDF, TXT, or other docs</div>
                </div>
              </button>
              {supportsReasoning && (
                <>
                  <div className="h-px bg-[#3A3A3A] my-2"></div>
                  <button
                    onClick={handleThinkingToggle}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3A3A3A] transition-colors text-left group"
                  >
                    <div className="p-2 rounded-lg bg-[#3A3A3A] group-hover:bg-[#4A4A4A] transition-colors">
                      <Brain size={18} className="text-[#CC785C]" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#E5E5E0]">
                        {useReasoning ? 'Disable' : 'Enable'} thinking
                      </div>
                      <div className="text-xs text-[#6B6B65]">
                        {useReasoning ? 'Turn off reasoning' : 'Show thought process'}
                      </div>
                    </div>
                    {useReasoning && (
                      <Sparkles size={16} className="text-[#CC785C]" />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const ReasoningPanel = ({ reasoning }: { reasoning: string }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    return (
      <div className="mb-3">
        <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] overflow-hidden">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2E2E2E] transition-colors text-left"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Brain size={16} className="text-[#CC785C] flex-shrink-0" />
              <span className="text-sm text-[#9B9B95]">
                Thought for a few seconds
              </span>
            </div>
            {isExpanded ? 
              <ChevronUp size={16} className="text-[#6B6B65] flex-shrink-0" /> : 
              <ChevronDown size={16} className="text-[#6B6B65] flex-shrink-0" />
            }
          </button>
          {isExpanded && (
            <div className="border-t border-[#3A3A3A] px-4 py-3 bg-[#252525]">
              <div className="text-sm text-[#9B9B95] leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto space-y-2">
                {reasoning.split('\n').map((line, idx) => (
                  line.trim() && <p key={idx}>{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const ReasoningControls = () => {
    if (!supportsReasoning) return null
    return (
      <div className="mb-3 rounded-xl border border-[#2E2E2E] bg-[#1E1E1E] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={useReasoning}
                onChange={(e) => setUseReasoning(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-11 h-6 bg-[#2A2A2A] rounded-full peer-checked:bg-[#CC785C] transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-5"></div>
            </div>
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-[#CC785C]" />
              <span className="text-sm font-medium text-[#E5E5E0]">
                Enhanced Reasoning
              </span>
            </div>
          </label>
          {useReasoning && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B6B65]">Effort:</span>
              <select
                value={reasoningEffort}
                onChange={(e) => setReasoningEffort(e.target.value as "low" | "medium" | "high")}
                className="px-3 py-1.5 rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] text-sm text-[#E5E5E0] focus:border-[#CC785C] focus:ring-1 focus:ring-[#CC785C] transition-all"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          )}
        </div>
        {useReasoning && (
          <div className="px-4 pb-3 text-xs text-[#6B6B65]">
            The model will show its step-by-step thinking process
          </div>
        )}
      </div>
    )
  }

  // Study Mode - PDF Interface
  if (studyMode) {
    return (
      <div className="relative h-full">
        {retryStatus.show && (
          <div className="fixed top-20 right-4 bg-[#2A2A2A] border border-yellow-600/50 rounded-lg p-3 shadow-xl z-50 max-w-xs animate-in slide-in-from-right duration-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-yellow-400">
                  Retrying... ({retryStatus.attemptNumber}/{retryStatus.totalAttempts})
                </p>
                <p className="text-xs text-[#9B9B95] truncate mt-0.5">
                  Trying: {retryStatus.currentModel.split('/').pop()?.replace(':free', '')}
                </p>
              </div>
            </div>
          </div>
        )}
        {fallbackInfo && (
          <div className="fixed top-20 right-4 bg-[#2A2A2A] border border-[#CC785C] rounded-lg p-4 shadow-xl z-50 max-w-sm animate-in slide-in-from-right duration-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#CC785C]/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#CC785C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-[#E5E5E0] mb-1 flex items-center gap-2">
                  <span>✓</span> Auto-Fallback Success
                </h4>
                <p className="text-xs text-[#9B9B95] mb-2">
                  Primary model unavailable. Automatically switched to working alternative.
                </p>
                <div className="text-xs space-y-1.5 bg-[#1E1E1E] rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B6B65] w-16">Original:</span>
                    <span className="text-red-400 font-mono text-[10px] truncate flex-1">
                      {fallbackInfo.originalModel.split('/').pop()?.replace(':free', '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B6B65] w-16">Using:</span>
                    <span className="text-green-400 font-mono text-[10px] truncate flex-1">
                      {fallbackInfo.usedModel.split('/').pop()?.replace(':free', '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 border-t border-[#3A3A3A]">
                    <span className="text-[#6B6B65]">
                      Failed attempts: {fallbackInfo.attempts}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setFallbackInfo(null)}
                className="flex-shrink-0 text-[#6B6B65] hover:text-[#E5E5E0] transition-colors p-1"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        <StudyPDFInterface
          selectedModel={selectedModel}
          onModelChange={onModelChange}
          onTokenCountChange={onTokenCountChange}
          messages={messages}
          onMessagesChange={onMessagesChange}
        />
      </div>
    )
  }

  // Regular Chat Mode
  return (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-white overflow-hidden">
      {retryStatus.show && (
        <div className="fixed top-20 right-4 bg-[#2A2A2A] border border-yellow-600/50 rounded-lg p-3 shadow-xl z-50 max-w-xs animate-in slide-in-from-right duration-200">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-500 border-t-transparent"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-400">
                Retrying... ({retryStatus.attemptNumber}/{retryStatus.totalAttempts})
              </p>
              <p className="text-xs text-[#9B9B95] truncate mt-0.5">
                Trying: {retryStatus.currentModel.split('/').pop()?.replace(':free', '')}
              </p>
            </div>
          </div>
        </div>
      )}
      {fallbackInfo && (
        <div className="fixed top-20 right-4 bg-[#2A2A2A] border border-[#CC785C] rounded-lg p-4 shadow-xl z-50 max-w-sm animate-in slide-in-from-right duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#CC785C]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#CC785C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-[#E5E5E0] mb-1 flex items-center gap-2">
                <span>✓</span> Auto-Fallback Success
              </h4>
              <p className="text-xs text-[#9B9B95] mb-2">
                Primary model unavailable. Automatically switched to working alternative.
              </p>
              <div className="text-xs space-y-1.5 bg-[#1E1E1E] rounded p-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#6B6B65] w-16">Original:</span>
                  <span className="text-red-400 font-mono text-[10px] truncate flex-1">
                    {fallbackInfo.originalModel.split('/').pop()?.replace(':free', '')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#6B6B65] w-16">Using:</span>
                  <span className="text-green-400 font-mono text-[10px] truncate flex-1">
                    {fallbackInfo.usedModel.split('/').pop()?.replace(':free', '')}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-[#3A3A3A]">
                  <span className="text-[#6B6B65]">
                    Failed attempts: {fallbackInfo.attempts}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setFallbackInfo(null)}
              className="flex-shrink-0 text-[#6B6B65] hover:text-[#E5E5E0] transition-colors p-1"
              title="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {analyzingFile && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-[#2A2A2A] border border-blue-600/50 rounded-lg p-4 shadow-xl z-50 max-w-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                <Sparkles size={16} className="absolute inset-0 m-auto text-blue-400" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-400 mb-1">
                🧠 AI Analyzing Document...
              </p>
              <p className="text-xs text-[#9B9B95]">
                Extracting structure, tables, insights, and visual content
              </p>
            </div>
          </div>
        </div>
      )}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
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
                  <>
                    {msg.role === "assistant" && i === messages.length - 1 && currentReasoning && (
                      <ReasoningPanel reasoning={currentReasoning} />
                    )}
                    <MessageBubble
                      message={msg}
                      onEdit={msg.role === "user" ? () => handleEditMessage(i) : undefined}
                      onRegenerate={msg.role === "assistant" ? () => handleRegenerateResponse(i) : undefined}
                      onThreadResponse={msg.role === "assistant" ? handleThreadResponse : undefined}
                      isStreaming={loading && i === messages.length - 1}
                    />
                  </>
                )}
              </div>
            ))}
            {loading && (
              <div className="mb-4">
                <div className="bg-[#2A2A2A] rounded-xl px-4 py-3 inline-block">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[#6B6B6B] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
        </div>
      </div>
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
      <div className="bg-[#1E1E1E] px-3 sm:px-4 pb-4 sm:pb-6 pt-3 sm:pt-4 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <ReasoningControls />
          <div className="sm:hidden mb-3">
            <ModelSelector 
              selectedModel={selectedModel} 
              onModelChange={onModelChange}
              hasImage={!!attachedImage}
            />
          </div>
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
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm text-white truncate">{attachedFile.name}</span>
                  {pdfImages.length > 0 && (
                    <span className="text-xs text-[#6B6B65]">{pdfImages.length} pages extracted</span>
                  )}
                  {fileContentSent && !analyzingFile && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <Sparkles size={12} />
                      AI-analyzed & ready
                    </span>
                  )}
                  {analyzingFile && (
                    <span className="text-xs text-blue-400 flex items-center gap-1">
                      <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setAttachedFile(null)
                  setPdfImages([])
                  setFileContentSent(false)
                }}
                className="ml-2 text-[#6B6B65] hover:text-[#D65D5D] transition flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="relative bg-[#2A2A2A] rounded-2xl sm:rounded-3xl border border-[#3A3A3A] focus-within:border-[#4A4A4A] transition-colors shadow-lg">
            <div className="absolute left-3 sm:left-4 bottom-[14px] sm:bottom-4 flex items-center gap-1 z-10">
              <PlusMenu />
              <FileUpload 
                onFileSelect={handleFileSelect}
                onImagesExtracted={handlePdfImagesExtracted}
                onPdfImageSelect={setPdfImages}
              />
              <VoiceInput onTranscript={(text) => setInput((prev) => prev + text)} />
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,.json,.csv,.md,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
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
            <div className="absolute right-3 sm:right-4 bottom-[14px] sm:bottom-4 flex items-center gap-2">
              <div className="hidden sm:block">
                <ModelSelector 
                  selectedModel={selectedModel} 
                  onModelChange={onModelChange}
                  hasImage={!!attachedImage}
                />
              </div>
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
