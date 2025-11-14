import React, { useState, useRef, useEffect } from 'react'
import { FileUp, X, ArrowUp, Sparkles, BookOpen, Search, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Camera, Code, Brain, Bot, MessageSquare, ChevronDown, FileText, AlertCircle } from 'lucide-react'

// Model configurations
const MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", shortName: "Gemini 2.0", provider: "Google", category: "Multimodal", supportsReasoning: false },
  { id: "qwen/qwen2.5-vl-32b-instruct:free", name: "Qwen2.5 VL 32B", shortName: "Qwen VL", provider: "Alibaba", category: "Multimodal", supportsReasoning: false },
  { id: "deepseek/deepseek-r1-distill-llama-70b:free", name: "DeepSeek R1 70B", shortName: "DeepSeek R1", provider: "DeepSeek", category: "Reasoning", supportsReasoning: true },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", shortName: "Llama 3.3", provider: "Meta", category: "General", supportsReasoning: false },
]

// Utility functions
const getIcon = (category) => {
  const icons = {
    Coding: <Code className="w-3.5 h-3.5" />,
    Multimodal: <Camera className="w-3.5 h-3.5" />,
    Reasoning: <Brain className="w-3.5 h-3.5" />,
    Agentic: <Bot className="w-3.5 h-3.5" />,
    General: <MessageSquare className="w-3.5 h-3.5" />
  }
  return icons[category] || icons.General
}

// Model Selector Component
function ModelSelector({ selectedModel, onModelChange }) {
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

  const groupedModels = MODELS.reduce((acc, model) => {
    if (!acc[model.category]) acc[model.category] = []
    acc[model.category].push(model)
    return acc
  }, {})

  const currentModel = MODELS.find((m) => m.id === selectedModel)

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] border border-[#3A3A3A] 
                   transition-colors flex items-center gap-2 text-sm min-w-[160px]"
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[#E5E5E0] text-sm truncate">
            {currentModel?.shortName || "Select Model"}
          </span>
          {currentModel?.supportsReasoning && (
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
              R
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#9B9B95] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl shadow-2xl z-50 
                        max-h-[400px] overflow-y-auto min-w-[280px]">
          {Object.entries(groupedModels).map(([category, models]) => (
            <div key={category}>
              <div className="px-3 py-2 text-[10px] uppercase font-semibold text-[#6B6B65] flex items-center gap-2 bg-[#1E1E1E] sticky top-0">
                {getIcon(category)} {category}
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors flex flex-col gap-1 ${
                    selectedModel === model.id
                      ? "bg-[#3A3A3A] text-white"
                      : "hover:bg-[#323232] text-[#E5E5E0]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-xs">{model.name}</div>
                    {model.supportsReasoning && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Brain className="w-2.5 h-2.5 inline" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#6B6B65]">{model.provider}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// PDF Viewer Component
function PDFViewer({ pdfUrl, currentPage, setCurrentPage, onPageClick }) {
  const [totalPages, setTotalPages] = useState(0)
  const [zoom, setZoom] = useState(1000)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        const maxPages = Math.min(pdf.numPages, 100)

        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i)
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          const viewport = page.getViewport({ scale: 1.5 })
          
          if (context) {
            canvas.height = viewport.height
            canvas.width = viewport.width
            await page.render({ canvasContext: context, viewport }).promise
            loadedPages.push({ image: canvas.toDataURL('image/png') })
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
      <div className="h-full flex items-center justify-center bg-[#1A1A1A]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#CC785C] mx-auto mb-4" />
          <p className="text-[#9B9B95]">Loading PDF...</p>
        </div>
      </div>
    )
  }

  if (error || totalPages === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1A1A1A]">
        <div className="text-center px-4">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-[#9B9B95]">{error || 'No PDF loaded'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A]">
      <div className="border-b border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleZoom('out')} 
            disabled={zoom <= 50}
            className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-[#9B9B95] w-12 text-center font-medium">{zoom}%</span>
          <button 
            onClick={() => handleZoom('in')} 
            disabled={zoom >= 200}
            className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ZoomIn size={18} />
          </button>
        </div>
        <div className="text-sm text-[#6B6B65] font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <button className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95]">
          <Download size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#0F0F0F] p-4 flex items-center justify-center">
        {pages[currentPage - 1] ? (
          <div
            className="bg-white shadow-2xl rounded-lg overflow-hidden cursor-pointer hover:shadow-[#CC785C]/20 hover:shadow-2xl transition-shadow"
            onClick={() => onPageClick && onPageClick(currentPage)}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <img 
              src={pages[currentPage - 1].image} 
              alt={`Page ${currentPage}`} 
              className="w-full h-auto"
              draggable={false}
            />
          </div>
        ) : (
          <div className="text-[#9B9B95]">Loading page...</div>
        )}
      </div>

      <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-[#9B9B95]"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 overflow-x-auto mx-3 flex gap-2 pb-2 scrollbar-thin scrollbar-thumb-[#3A3A3A] scrollbar-track-transparent">
          {pages.slice(0, Math.min(15, totalPages)).map((page, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`flex-shrink-0 h-14 w-10 rounded border-2 transition-all ${
                currentPage === idx + 1 
                  ? 'border-[#CC785C] shadow-lg shadow-[#CC785C]/30 scale-105' 
                  : 'border-[#2E2E2E] hover:border-[#CC785C]/50 hover:scale-105'
              }`}
            >
              <img 
                src={page.image} 
                alt={`Thumb ${idx + 1}`} 
                className="w-full h-full object-cover rounded" 
                draggable={false}
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-[#9B9B95]"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}

// Message Bubble Component
function MessageBubble({ message, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#CC785C] to-[#B8674A] flex items-center justify-center mr-2 shadow-lg">
          <FileText size={16} className="text-white" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-xl px-4 py-3 shadow-md ${
        isUser 
          ? 'bg-gradient-to-br from-[#CC785C] to-[#B8674A] text-white' 
          : 'bg-[#2A2A2A] text-[#E5E5E0] border border-[#3A3A3A]'
      }`}>
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#3A3A3A]/50 text-xs text-[#9B9B95] flex items-center gap-2 flex-wrap">
            <BookOpen size={12} className="text-[#CC785C]" />
            <span className="font-semibold text-[#CC785C]">References:</span>
            <div className="flex gap-1.5 flex-wrap">
              {message.citations.map((cite, i) => (
                <span key={i} className="px-2 py-0.5 bg-[#3A3A3A] rounded-md text-[#E5E5E0] font-medium hover:bg-[#4A4A4A] transition-colors">
                  p.{cite}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3A3A3A] flex items-center justify-center ml-2 border border-[#4A4A4A]">
          <MessageSquare size={16} className="text-[#E5E5E0]" />
        </div>
      )}
    </div>
  )
}

// Main Component
export default function StudyPDFInterface({ 
  selectedModel: externalModel, 
  onModelChange: externalOnModelChange,
  onTokenCountChange,
  messages: externalMessages,
  onMessagesChange
}) {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfChunks, setPdfChunks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(externalMessages || [])
  const [loading, setLoading] = useState(false)
  const [processingPDF, setProcessingPDF] = useState(false)
  const [selectedModel, setSelectedModel] = useState(externalModel || MODELS[0].id)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Sync external messages
  useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages)
    }
  }, [externalMessages])

  // Helper function to update messages and notify parent
  const updateMessages = (newMessages) => {
    setMessages(newMessages)
    if (onMessagesChange) {
      onMessagesChange(newMessages)
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Sync external model changes
  useEffect(() => {
    if (externalModel) {
      setSelectedModel(externalModel)
    }
  }, [externalModel])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleModelChange = (model) => {
    setSelectedModel(model)
    if (externalOnModelChange) {
      externalOnModelChange(model)
    }
  }

  // Intelligent PDF content chunking with overlap
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
          startIndex: start,
          endIndex: end
        })
        
        start = end - OVERLAP
        if (start >= text.length - OVERLAP) break
      }
    })

    return chunks
  }

  // Smart relevance scoring for chunk retrieval
  const findRelevantChunks = (query, chunks, topK = 5) => {
    const queryWords = query.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .filter(w => !['the', 'and', 'for', 'are', 'but', 'not', 'with', 'from'].includes(w))
    
    const scoredChunks = chunks.map(chunk => {
      const chunkText = chunk.text.toLowerCase()
      let score = 0
      
      // Exact phrase matching
      if (chunkText.includes(query.toLowerCase())) {
        score += 100
      }
      
      // Word frequency scoring
      queryWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi')
        const matches = chunkText.match(regex)
        if (matches) {
          score += matches.length * 10
        }
      })
      
      // Proximity bonus (words appearing close together)
      let proximityScore = 0
      for (let i = 0; i < queryWords.length - 1; i++) {
        const word1Idx = chunkText.indexOf(queryWords[i])
        const word2Idx = chunkText.indexOf(queryWords[i + 1])
        if (word1Idx !== -1 && word2Idx !== -1) {
          const distance = Math.abs(word2Idx - word1Idx)
          if (distance < 100) {
            proximityScore += (100 - distance) / 10
          }
        }
      }
      score += proximityScore
      
      return { ...chunk, score }
    })

    return scoredChunks
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }

  // API call handler with better error handling
  const callAPI = async (userPrompt, contextChunks = null) => {
    try {
      const requestBody = {
        messages: [{ role: 'user', content: userPrompt }],
        model: selectedModel,
        stream: false,
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.content) {
        throw new Error('No response content received from API')
      }
      
      return data.content
    } catch (error) {
      console.error('API call failed:', error)
      throw error
    }
  }

  // Handle PDF file selection and processing
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
        throw new Error('PDF.js library not loaded. Please refresh the page.')
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
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      })
      setPdfChunks(chunks)
      updateMessages([])
      setInput('')
      setCurrentPage(1)
      setProcessingPDF(false)
    } catch (err) {
      console.error('Error processing PDF:', err)
      setProcessingPDF(false)
      alert(`Failed to process PDF: ${err.message}. Please try again.`)
    }
  }

  // Handle sending messages with context retrieval
  const handleSendMessage = async () => {
    if (!input.trim() || !pdfFile || loading) return

    const userQuestion = input.trim()
    const userMessage = { role: 'user', content: userQuestion, isUser: true }
    
    updateMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const relevantChunks = findRelevantChunks(userQuestion, pdfChunks, 5)
      
      const context = relevantChunks.length > 0
        ? relevantChunks.map(chunk => 
            `[Page ${chunk.pageNumber}]\n${chunk.text}`
          ).join('\n\n---\n\n')
        : pdfChunks.slice(0, 3).map(chunk => 
            `[Page ${chunk.pageNumber}]\n${chunk.text}`
          ).join('\n\n---\n\n')

      const citations = [...new Set(relevantChunks.map(c => c.pageNumber))].sort((a, b) => a - b)

      const prompt = `You are an intelligent PDF study assistant analyzing "${pdfFile.name}".

📄 **Context from Document:**
${context}

❓ **User Question:** ${userQuestion}

**Instructions:**
- Answer based ONLY on the provided context
- Be specific and cite page numbers when referencing information
- If the context doesn't contain enough information, clearly state that
- Provide detailed, well-structured responses
- Use markdown formatting for clarity
- Be conversational yet professional

Provide your answer:`

      const content = await callAPI(prompt, relevantChunks)

      updateMessages(prev => [...prev, {
        role: 'assistant',
        content,
        isUser: false,
        citations: citations.length > 0 ? citations : undefined
      }])
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      updateMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Error:** ${error.message}\n\nPlease try again or rephrase your question.`,
        isUser: false
      }])
    } finally {
      setLoading(false)
    }
  }

  // Handle PDF summarization
  const handleSummarizePDF = async () => {
    if (!pdfFile || loading) return

    updateMessages(prev => [...prev, { 
      role: 'user', 
      content: '📚 Summarize this entire document', 
      isUser: true 
    }])
    setLoading(true)

    try {
      const allText = pdfFile.pages
        .slice(0, 50)
        .map(p => `[Page ${p.pageNumber}]\n${p.text}`)
        .join('\n\n')
        .slice(0, 40000)

      const prompt = `Provide a comprehensive summary of this document:

📄 **Document:** ${pdfFile.name}
📖 **Total Pages:** ${pdfFile.totalPages}

**Content (first 50 pages):**
${allText}

Create a well-structured summary with:

## 📌 Main Topic
What is this document about? (2-3 sentences)

## 🗂️ Key Sections
What are the main parts, chapters, or themes?

## ⭐ Important Points
What are the critical takeaways and main arguments?

## 💡 Key Insights
What patterns, trends, or conclusions emerge?

## 📝 Summary
Brief overview that captures the essence of the document

Use clear markdown formatting and make it engaging to read.`

      const content = await callAPI(prompt)
      updateMessages(prev => [...prev, { role: 'assistant', content, isUser: false }])
    } catch (error) {
      console.error('Error in handleSummarizePDF:', error)
      updateMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ **Error generating summary:** ${error.message}\n\nPlease try again.`, 
        isUser: false 
      }])
    } finally {
      setLoading(false)
    }
  }

  // Handle explaining current page
  const handlePageContext = async () => {
    if (!pdfFile || loading || currentPage < 1) return

    const pageData = pdfFile.pages[currentPage - 1]
    if (!pageData || !pageData.text || pageData.text.trim().length < 20) {
      updateMessages(prev => [...prev, 
        { role: 'user', content: `📄 Explain page ${currentPage}`, isUser: true },
        { role: 'assistant', content: '⚠️ This page appears to be empty or contains very little text content.', isUser: false }
      ])
      return
    }

    updateMessages(prev => [...prev, { 
      role: 'user', 
      content: `📄 Explain page ${currentPage}`, 
      isUser: true 
    }])
    setLoading(true)

    try {
      const prompt = `Explain the content of page ${currentPage} from "${pdfFile.name}":

**[Page ${currentPage}]**
${pageData.text}

Please provide a detailed explanation with:

## 🎯 Main Topic
What is this page primarily about?

## 📋 Key Points
List and explain the important details, facts, or arguments

## 🔗 Context
How does this content fit into the overall document?

## 📝 Summary
Brief overview in simple, clear language

Be thorough but concise. Use examples where helpful.`

      const content = await callAPI(prompt)
      updateMessages(prev => [...prev, {
        role: 'assistant',
        content,
        isUser: false,
        citations: [currentPage]
      }])
    } catch (error) {
      console.error('Error in handlePageContext:', error)
      updateMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `❌ **Error explaining page ${currentPage}:** ${error.message}\n\nPlease try again.`, 
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

  const handleReset = () => {
    if (window.confirm('Are you sure you want to close this PDF and start over?')) {
      setPdfFile(null)
      setPdfChunks([])
      updateMessages([])
      setInput('')
      setCurrentPage(1)
    }
  }

  // Loading state
  if (processingPDF) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E1E1E]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-[#CC785C] mx-auto mb-4" />
          <p className="text-[#E5E5E0] text-lg font-medium">Processing PDF...</p>
          <p className="text-[#6B6B65] text-sm mt-2">Extracting text and preparing for analysis</p>
        </div>
      </div>
    )
  }

  // Upload state
  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E1E1E]">
        <div className="text-center px-4 max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] border-2 border-[#3A3A3A] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileUp size={48} className="text-[#CC785C]" />
          </div>
          <h2 className="text-3xl font-bold text-[#E5E5E0] mb-3">Intelligent PDF Study</h2>
          <p className="text-[#9B9B95] mb-2">Upload any PDF document and ask questions</p>
          <p className="text-[#6B6B65] text-sm mb-8">Get AI-powered answers with accurate page citations</p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-4 bg-gradient-to-r from-[#CC785C] to-[#B8674A] hover:from-[#B8674A] hover:to-[#A85638] text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-[#CC785C]/30"
          >
            Choose PDF File
          </button>
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-[#6B6B65]">
            <div className="flex flex-col items-center">
              <Search className="w-6 h-6 mb-2 text-[#CC785C]" />
              <span>Smart Search</span>
            </div>
            <div className="flex flex-col items-center">
              <BookOpen className="w-6 h-6 mb-2 text-[#CC785C]" />
              <span>Page Citations</span>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="w-6 h-6 mb-2 text-[#CC785C]" />
              <span>AI Summaries</span>
            </div>
          </div>
          
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

  // Main interface
  return (
    <div className="flex h-full bg-[#1E1E1E] text-white overflow-hidden">
      {/* PDF Viewer Section */}
      <div className="w-1/2 flex flex-col border-r border-[#2E2E2E] overflow-hidden">
        <PDFViewer 
          pdfUrl={pdfFile.url} 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          onPageClick={(page) => console.log('Clicked page:', page)} 
        />
      </div>

      {/* Chat Section */}
      <div className="w-1/2 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-semibold text-[#E5E5E0] truncate flex items-center gap-2">
              <FileText size={16} className="text-[#CC785C]" />
              {pdfFile.name}
            </p>
            <p className="text-xs text-[#6B6B65] mt-1">
              {pdfFile.totalPages} pages • {pdfChunks.length} chunks • {pdfFile.size}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} />
            <button
              onClick={handleReset}
              className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95] hover:text-red-400"
              title="Close PDF"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-b border-[#2E2E2E] bg-[#1A1A1A] px-4 py-3 flex gap-2 flex-shrink-0 overflow-x-auto">
          <button
            onClick={handleSummarizePDF}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#E5E5E0] text-sm whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-[#3A3A3A] hover:border-[#CC785C]/50"
          >
            <Sparkles size={16} className="text-[#CC785C]" />
            Summarize Document
          </button>
          <button
            onClick={handlePageContext}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#E5E5E0] text-sm whitespace-nowrap transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-[#3A3A3A] hover:border-[#CC785C]/50"
          >
            <BookOpen size={16} className="text-[#CC785C]" />
            Explain Page {currentPage}
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#1A1A1A]">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="max-w-md">
                <div className="w-16 h-16 rounded-full bg-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-[#CC785C]" />
                </div>
                <h3 className="text-lg font-semibold text-[#E5E5E0] mb-2">Ask anything about your PDF</h3>
                <p className="text-sm text-[#9B9B95] mb-4">Get AI-powered answers with accurate page citations</p>
                
                <div className="grid gap-2 text-left">
                  <button 
                    onClick={() => setInput("What is the main topic of this document?")}
                    className="p-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg text-sm text-[#E5E5E0] transition-colors text-left border border-[#3A3A3A]"
                  >
                    💡 What is the main topic of this document?
                  </button>
                  <button 
                    onClick={() => setInput("Can you explain the key concepts?")}
                    className="p-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg text-sm text-[#E5E5E0] transition-colors text-left border border-[#3A3A3A]"
                  >
                    📚 Can you explain the key concepts?
                  </button>
                  <button 
                    onClick={() => setInput("What are the most important takeaways?")}
                    className="p-3 bg-[#2A2A2A] hover:bg-[#3A3A3A] rounded-lg text-sm text-[#E5E5E0] transition-colors text-left border border-[#3A3A3A]"
                  >
                    ⭐ What are the most important takeaways?
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} isUser={msg.isUser} />
              ))}
              {loading && (
                <div className="flex justify-start mb-4 animate-fadeIn">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#CC785C] to-[#B8674A] flex items-center justify-center mr-2 shadow-lg">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div className="bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-[#CC785C] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#CC785C] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-[#CC785C] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-4 flex-shrink-0">
          <div className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document..."
              className="resize-none bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder-[#6B6B6B] focus:border-[#CC785C] focus:outline-none rounded-xl text-sm flex-1 px-4 py-3 max-h-[120px] transition-colors"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#CC785C] to-[#B8674A] hover:from-[#B8674A] hover:to-[#A85638] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center self-end shadow-lg hover:shadow-[#CC785C]/30 disabled:hover:shadow-none transform hover:scale-105 disabled:hover:scale-100"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <ArrowUp size={20} strokeWidth={2.5} />
              )}
            </button>
          </div>
          <p className="text-xs text-[#6B6B65] mt-2 flex items-center gap-2">
            <span>Press Enter to send • Shift+Enter for new line</span>
            {messages.length > 0 && (
              <span className="ml-auto text-[#CC785C]">{messages.length} messages</span>
            )}
          </p>
        </div>
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
