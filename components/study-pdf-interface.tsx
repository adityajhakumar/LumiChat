"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { FileUp, X, Send, Sparkles, BookOpen, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Maximize2, GripVertical, FileText, AlertCircle, MessageSquare, Bot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Model configurations
const MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "qwen/qwen2.5-vl-32b-instruct:free", name: "Qwen2.5 VL 32B", provider: "Alibaba" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", provider: "Meta" },
]

// Markdown Components
const MarkdownComponents = {
  h1: ({...props}: any) => <h1 className="text-2xl font-bold mt-6 mb-4 text-[#E5E5E0]" {...props} />,
  h2: ({...props}: any) => <h2 className="text-xl font-bold mt-5 mb-3 text-[#E5E5E0]" {...props} />,
  h3: ({...props}: any) => <h3 className="text-lg font-semibold mt-4 mb-2 text-[#E5E5E0]" {...props} />,
  p: ({...props}: any) => <p className="mb-3 leading-relaxed text-[#D4D4CF]" {...props} />,
  ul: ({...props}: any) => <ul className="list-disc list-inside mb-3 space-y-1 text-[#D4D4CF]" {...props} />,
  ol: ({...props}: any) => <ol className="list-decimal list-inside mb-3 space-y-1 text-[#D4D4CF]" {...props} />,
  li: ({...props}: any) => <li className="ml-4" {...props} />,
  code: ({inline, ...props}: any) => 
    inline 
      ? <code className="bg-[#2A2A2A] px-1.5 py-0.5 rounded text-[#E5E5E0] text-sm font-mono" {...props} />
      : <code className="block bg-[#1A1A1A] p-4 rounded-lg text-[#E5E5E0] text-sm font-mono overflow-x-auto mb-3" {...props} />,
  blockquote: ({...props}: any) => <blockquote className="border-l-4 border-[#CC785C] pl-4 italic my-3 text-[#9B9B95]" {...props} />,
  strong: ({...props}: any) => <strong className="font-semibold text-[#E5E5E0]" {...props} />,
  em: ({...props}: any) => <em className="italic text-[#D4D4CF]" {...props} />,
  a: ({...props}: any) => <a className="text-[#CC785C] hover:underline" {...props} />,
}

// Model Selector Component
function ModelSelector({ selectedModel, onModelChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const currentModel = MODELS.find((m) => m.id === selectedModel)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="px-3 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] border border-[#3A3A3A] 
                   transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-[#E5E5E0] text-xs font-medium truncate max-w-[120px]">
          {currentModel?.name || "Select Model"}
        </span>
        <ChevronRight size={14} className={`text-[#9B9B95] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-2xl z-50 
                        min-w-[220px] overflow-hidden">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2.5 transition-colors flex flex-col gap-0.5 ${
                selectedModel === model.id
                  ? "bg-[#3A3A3A] text-white"
                  : "hover:bg-[#323232] text-[#E5E5E0]"
              }`}
            >
              <div className="font-medium text-sm">{model.name}</div>
              <div className="text-[10px] text-[#6B6B65]">{model.provider}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// PDF Viewer Component
function PDFViewer({ pdfUrl, currentPage, setCurrentPage, zoom, setZoom, rotation, setRotation }) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setError(null)
        setLoading(true)
        
        if (!window.pdfjsLib) {
          throw new Error('PDF.js library not loaded')
        }
        
        const pdfjsLib = window.pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        setTotalPages(pdf.numPages)

        const loadedPages = []
        for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
          const page = await pdf.getPage(i)
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          const viewport = page.getViewport({ scale: 2 })
          
          if (context) {
            canvas.height = viewport.height
            canvas.width = viewport.width
            await page.render({ canvasContext: context, viewport }).promise
            loadedPages.push({ image: canvas.toDataURL('image/png'), pageNumber: i })
          }
        }

        setPages(loadedPages)
        setLoading(false)
      } catch (error) {
        console.error('Error loading PDF:', error)
        setError(error.message || 'Failed to load PDF')
        setLoading(false)
      }
    }

    if (pdfUrl) loadPdf()
  }, [pdfUrl])

  const handleZoom = (direction) => {
    setZoom(prev => {
      if (direction === 'in' && prev < 200) return prev + 25
      if (direction === 'out' && prev > 50) return prev - 25
      return prev
    })
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#CC785C] mx-auto mb-3" />
          <p className="text-[#9B9B95] text-sm">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-center px-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-[#9B9B95] text-sm">{error}</p>
        </div>
      </div>
    )
  }

  const currentPageData = pages[currentPage - 1]

  return (
    <div className="flex flex-col h-full bg-[#0F0F0F]">
      {/* Toolbar */}
      <div className="border-b border-[#2E2E2E] bg-[#171717] px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleZoom('out')} 
            disabled={zoom <= 50}
            className="p-1.5 hover:bg-[#2A2A2A] rounded disabled:opacity-40 text-[#9B9B95]"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-[#9B9B95] w-12 text-center font-medium">{zoom}%</span>
          <button 
            onClick={() => handleZoom('in')} 
            disabled={zoom >= 200}
            className="p-1.5 hover:bg-[#2A2A2A] rounded disabled:opacity-40 text-[#9B9B95]"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
          <div className="w-px h-4 bg-[#2E2E2E] mx-1"></div>
          <button 
            onClick={() => setRotation((prev) => (prev + 90) % 360)}
            className="p-1.5 hover:bg-[#2A2A2A] rounded text-[#9B9B95]"
            title="Rotate"
          >
            <RotateCw size={16} />
          </button>
        </div>
        <div className="text-xs text-[#6B6B65] font-medium">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto bg-[#0F0F0F] p-4 flex items-start justify-center">
        {currentPageData && (
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
            }}
            className="bg-white shadow-2xl transition-transform"
          >
            <img 
              src={currentPageData.image} 
              alt={`Page ${currentPage}`} 
              className="w-full h-auto"
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t border-[#2E2E2E] bg-[#171717] px-3 py-2 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 hover:bg-[#2A2A2A] disabled:opacity-40 disabled:cursor-not-allowed rounded text-[#9B9B95]"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page)
              }
            }}
            className="w-14 px-2 py-1 bg-[#2A2A2A] border border-[#3A3A3A] text-[#E5E5E0] rounded text-xs text-center focus:outline-none focus:border-[#CC785C]"
          />
          <span className="text-xs text-[#6B6B65]">of {totalPages}</span>
        </div>

        <button
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 hover:bg-[#2A2A2A] disabled:opacity-40 disabled:cursor-not-allowed rounded text-[#9B9B95]"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

// Message Component
function Message({ message, onRetry }) {
  if (message.isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fadeIn">
        <div className="max-w-[80%] bg-[#2A2A2A] text-[#E5E5E0] rounded-2xl px-4 py-3 border border-[#3A3A3A]">
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>
        </div>
      </div>
    )
  }

  const isError = message.content.includes('**Error:**') || message.content.includes('**⚠️')

  return (
    <div className="flex justify-start mb-6 animate-fadeIn">
      <div className="max-w-[85%]">
        <div className="flex items-start gap-3">
          <div className={`w-7 h-7 rounded-full ${isError ? 'bg-red-500/20 border-2 border-red-500/50' : 'bg-gradient-to-br from-[#CC785C] to-[#B8674A]'} flex items-center justify-center flex-shrink-0 mt-1`}>
            {isError ? <AlertCircle size={16} className="text-red-400" /> : <Bot size={16} className="text-white" />}
          </div>
          <div className="flex-1">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={MarkdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            {message.citations && message.citations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#2E2E2E] flex items-center gap-2 flex-wrap">
                <BookOpen size={12} className="text-[#CC785C]" />
                <span className="text-xs text-[#6B6B65]">Referenced pages:</span>
                {message.citations.map((cite, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-[#2A2A2A] rounded text-[#CC785C] border border-[#3A3A3A]">
                    {cite}
                  </span>
                ))}
              </div>
            )}
            {isError && onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-3 py-1.5 bg-[#CC785C] hover:bg-[#B8674A] text-white text-xs rounded-md transition-colors flex items-center gap-1.5"
              >
                <RotateCw size={12} />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function StudyPDFInterface() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfChunks, setPdfChunks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingPDF, setProcessingPDF] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [splitPosition, setSplitPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [lastQuery, setLastQuery] = useState(null)
  
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const splitContainerRef = useRef(null)

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  // Handle split panel dragging
  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !splitContainerRef.current) return
    
    const container = splitContainerRef.current
    const rect = container.getBoundingClientRect()
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100
    
    if (newPosition >= 30 && newPosition <= 70) {
      setSplitPosition(newPosition)
    }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Chunk PDF content
  const chunkPDFContent = (pdfPages) => {
    const chunks = []
    const CHUNK_SIZE = 1000
    const OVERLAP = 200

    pdfPages.forEach((pageData, pageIndex) => {
      const pageNum = pageIndex + 1
      const text = pageData.text
      
      if (!text || text.trim().length < 50) return

      let start = 0
      while (start < text.length) {
        const end = Math.min(start + CHUNK_SIZE, text.length)
        const chunk = text.slice(start, end)
        
        chunks.push({
          text: chunk,
          pageNumber: pageNum,
        })
        
        start = end - OVERLAP
        if (start >= text.length - OVERLAP) break
      }
    })

    return chunks
  }

  // Find relevant chunks
  const findRelevantChunks = (query, chunks, topK = 5) => {
    const queryWords = query.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .filter(w => !['the', 'and', 'for', 'are', 'but', 'not', 'with', 'from'].includes(w))
    
    const scoredChunks = chunks.map(chunk => {
      const chunkText = chunk.text.toLowerCase()
      let score = 0
      
      if (chunkText.includes(query.toLowerCase())) {
        score += 100
      }
      
      queryWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        const matches = chunkText.match(regex)
        if (matches) {
          score += matches.length * 10
        }
      })
      
      return { ...chunk, score }
    })

    return scoredChunks
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }

  // API call with retry and fallback
  const callAPI = async (userPrompt, retryCount = 0) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userPrompt }],
          model: selectedModel,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        // Handle rate limiting with automatic fallback
        if (response.status === 429 || errorData.error?.code === 429) {
          // If we haven't tried other models yet
          if (retryCount === 0) {
            // Try to find an alternative model
            const currentModelIndex = MODELS.findIndex(m => m.id === selectedModel)
            const nextModel = MODELS[(currentModelIndex + 1) % MODELS.length]
            
            console.log(`Rate limited on ${selectedModel}, trying ${nextModel.id}`)
            
            // Temporarily switch model and retry
            const originalModel = selectedModel
            setSelectedModel(nextModel.id)
            
            try {
              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messages: [{ role: 'user', content: userPrompt }],
                  model: nextModel.id,
                  stream: false,
                }),
              })
              
              if (response.ok) {
                const data = await response.json()
                if (data.content) {
                  return data.content
                }
              }
              
              // Restore original model if retry failed
              setSelectedModel(originalModel)
            } catch (retryError) {
              setSelectedModel(originalModel)
              throw retryError
            }
          }
          
          throw new Error('Rate limited. Please try again in a few moments, or switch to a different model.')
        }
        
        // Handle moderation errors
        if (response.status === 403 || errorData.error?.code === 403) {
          throw new Error('Content moderation flagged this request. Please try a different model or rephrase your question.')
        }
        
        throw new Error(errorData.error?.message || `API Error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.content) {
        throw new Error('No response received')
      }
      
      return data.content
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file')
      return
    }

    setProcessingPDF(true)
    const url = URL.createObjectURL(file)
    
    try {
      const buffer = await file.arrayBuffer()
      
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library not loaded')
      }
      
      const pdfjsLib = window.pdfjsLib
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const pdfPages = []
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const text = textContent.items
          .map(item => item.str || '')
          .join(' ')
          .trim()
          .replace(/\s+/g, ' ')
        
        pdfPages.push({ pageNumber: i, text })
      }
      
      const chunks = chunkPDFContent(pdfPages)
      
      setPdfFile({ 
        name: file.name, 
        url, 
        totalPages: pdf.numPages, 
        pages: pdfPages,
      })
      setPdfChunks(chunks)
      setMessages([])
      setInput('')
      setCurrentPage(1)
      setProcessingPDF(false)
    } catch (err) {
      console.error('Error processing PDF:', err)
      setProcessingPDF(false)
      alert(`Failed to process PDF: ${err.message}`)
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!input.trim() || !pdfFile || loading) return

    const userQuestion = input.trim()
    const userMessage = { role: 'user', content: userQuestion, isUser: true }
    
    // Store query for retry
    setLastQuery(userQuestion)
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Check if question is about specific page
      const pageMatch = userQuestion.match(/page\s+(\d+)/i)
      let relevantChunks = []
      
      if (pageMatch) {
        const requestedPage = parseInt(pageMatch[1])
        // Get all chunks from the requested page
        relevantChunks = pdfChunks.filter(chunk => chunk.pageNumber === requestedPage)
        
        // If no chunks found for that page, get surrounding pages
        if (relevantChunks.length === 0) {
          relevantChunks = pdfChunks.filter(chunk => 
            Math.abs(chunk.pageNumber - requestedPage) <= 1
          )
        }
      } else {
        // Use semantic search for general questions
        relevantChunks = findRelevantChunks(userQuestion, pdfChunks, 5)
      }
      
      // Fallback: if no relevant chunks found, use current page context
      if (relevantChunks.length === 0) {
        relevantChunks = pdfChunks.filter(chunk => 
          Math.abs(chunk.pageNumber - currentPage) <= 1
        ).slice(0, 5)
      }
      
      const context = relevantChunks.map(chunk => 
        `[Page ${chunk.pageNumber}]\n${chunk.text}`
      ).join('\n\n---\n\n')

      const citations = [...new Set(relevantChunks.map(c => c.pageNumber))].sort((a, b) => a - b)

      const prompt = `You are a helpful PDF study assistant analyzing "${pdfFile.name}".

Here is the relevant content from the document:

${context}

User Question: ${userQuestion}

Instructions:
- Answer based ONLY on the provided context above
- Use markdown formatting for clarity
- Be specific and reference page numbers when appropriate
- If the context contains the answer, provide a detailed response
- If you need to see different pages, ask the user to specify

Provide your answer:`

      const content = await callAPI(prompt)

      setMessages(prev => [...prev, {
        role: 'assistant',
        content,
        isUser: false,
        citations: citations.length > 0 ? citations : undefined
      }])
    } catch (error) {
      const errorMessage = error.message || 'An error occurred'
      
      // Check if it's a rate limit error and suggest alternative
      let displayMessage = `**Error:** ${errorMessage}`
      
      if (errorMessage.includes('Rate limited')) {
        const availableModels = MODELS.filter(m => m.id !== selectedModel)
        displayMessage = `**⚠️ Rate Limit Reached**\n\n${errorMessage}\n\n**Try these alternatives:**\n${availableModels.map(m => `- ${m.name} (${m.provider})`).join('\n')}\n\nYou can switch models using the dropdown in the header.`
      } else if (errorMessage.includes('moderation')) {
        displayMessage = `**⚠️ Content Moderation**\n\n${errorMessage}\n\n**Suggestions:**\n- Try rephrasing your question\n- Switch to a different model\n- Ask more specific questions about the document`
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: displayMessage,
        isUser: false
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Retry last query
  const handleRetry = () => {
    if (lastQuery && !loading) {
      setInput(lastQuery)
      setTimeout(() => handleSendMessage(), 100)
    }
  }

  // Upload state
  if (processingPDF) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1A1A1A]">
        <div className="text-center">
          <Loader2 className="w-14 h-14 animate-spin text-[#CC785C] mx-auto mb-4" />
          <p className="text-[#E5E5E0] text-lg font-medium">Processing PDF...</p>
          <p className="text-[#6B6B65] text-sm mt-2">Extracting text and preparing document</p>
        </div>
      </div>
    )
  }

  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1A1A1A]">
        <div className="text-center px-4 max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#2A2A2A] border-2 border-[#3A3A3A] flex items-center justify-center mx-auto mb-6">
            <FileUp size={40} className="text-[#CC785C]" />
          </div>
          <h2 className="text-2xl font-bold text-[#E5E5E0] mb-2">Upload PDF Document</h2>
          <p className="text-[#9B9B95] mb-6">Upload any PDF and chat with it using AI</p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-[#CC785C] to-[#B8674A] hover:from-[#B8674A] hover:to-[#A85638] text-white rounded-lg font-medium transition-all transform hover:scale-105"
          >
            Choose PDF File
          </button>
          
          <input 
            ref={fileInputRef} 
            type="file" 
            accept=".pdf" 
            onChange={handleFileSelect} 
            className="hidden" 
          />
        </div>
      </div>
    )
  }

  // Main interface with split panels
  return (
    <div 
      ref={splitContainerRef}
      className="flex h-full bg-[#1A1A1A] overflow-hidden select-none"
      style={{ cursor: isDragging ? 'col-resize' : 'default' }}
    >
      {/* Left Panel - Chat */}
      <div 
        className="flex flex-col bg-[#1A1A1A] overflow-hidden"
        style={{ width: `${splitPosition}%` }}
      >
        {/* Header */}
        <div className="border-b border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-[#CC785C]" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#E5E5E0] truncate max-w-[200px]">{pdfFile.name}</span>
              <span className="text-xs text-[#6B6B65]">{pdfFile.totalPages} pages • {pdfChunks.length} chunks</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector selectedModel={selectedModel} onModelChange={setSelectedModel} disabled={loading} />
            <button
              onClick={() => {
                if (window.confirm('Close this PDF?')) {
                  setPdfFile(null)
                  setMessages([])
                  setInput('')
                }
              }}
              className="p-2 hover:bg-[#2A2A2A] rounded text-[#9B9B95] hover:text-red-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-b border-[#2E2E2E] bg-[#1A1A1A] px-4 py-2 flex gap-2 overflow-x-auto flex-shrink-0">
          <button
            onClick={() => {
              setInput("Summarize this entire document")
              setTimeout(() => handleSendMessage(), 100)
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#E5E5E0] text-xs whitespace-nowrap transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-[#3A3A3A]"
          >
            <Sparkles size={14} className="text-[#CC785C]" />
            Summarize
          </button>
          <button
            onClick={() => {
              setInput(`Explain page ${currentPage} in detail`)
              setTimeout(() => handleSendMessage(), 100)
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#E5E5E0] text-xs whitespace-nowrap transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-[#3A3A3A]"
          >
            <BookOpen size={14} className="text-[#CC785C]" />
            Explain Page {currentPage}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <MessageSquare className="w-12 h-12 text-[#CC785C] mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-[#E5E5E0] mb-2">Start a Conversation</h3>
                <p className="text-sm text-[#9B9B95] mb-4">Ask questions about your PDF document</p>
                <div className="grid gap-2">
                  {["What is this document about?", "Summarize the key points", "Explain page " + currentPage].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="p-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg text-sm text-[#E5E5E0] text-left border border-[#3A3A3A] transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <Message key={i} message={msg} onRetry={msg.content?.includes('**Error:**') || msg.content?.includes('**⚠️') ? handleRetry : null} />
              ))}
              {loading && (
                <div className="flex justify-start mb-6 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#CC785C] to-[#B8674A] flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-[#2A2A2A] rounded-2xl px-4 py-3 border border-[#3A3A3A]">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-[#CC785C] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#CC785C] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#CC785C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-3 flex-shrink-0">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document..."
              disabled={loading}
              className="resize-none bg-[#2A2A2A] border border-[#3A3A3A] text-[#E5E5E0] placeholder-[#6B6B6B] focus:border-[#CC785C] focus:outline-none rounded-lg text-sm flex-1 px-3 py-2 max-h-[120px] disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-[#CC785C] hover:bg-[#B8674A] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center self-end"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
          <p className="text-xs text-[#6B6B65] mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Resizable Divider */}
      <div 
        className="w-1 bg-[#2E2E2E] hover:bg-[#CC785C] cursor-col-resize flex items-center justify-center group transition-colors relative"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
        <GripVertical size={16} className="text-[#6B6B65] group-hover:text-[#CC785C] transition-colors" />
      </div>

      {/* Right Panel - PDF Viewer */}
      <div 
        className="flex flex-col overflow-hidden"
        style={{ width: `${100 - splitPosition}%` }}
      >
        <PDFViewer 
          pdfUrl={pdfFile.url}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          zoom={zoom}
          setZoom={setZoom}
          rotation={rotation}
          setRotation={setRotation}
        />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
