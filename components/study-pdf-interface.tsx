import React, { useState, useRef, useEffect } from 'react'
import { FileUp, X, ArrowUp, Sparkles, BookOpen, Search, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Camera, Code, Brain, Bot, MessageSquare, ChevronDown, FileText } from 'lucide-react'

// Model configurations
const MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", shortName: "Gemini 2.0", provider: "Google", category: "Multimodal", supportsReasoning: false },
  { id: "qwen/qwen2.5-vl-32b-instruct:free", name: "Qwen2.5 VL 32B", shortName: "Qwen VL", provider: "Alibaba", category: "Multimodal", supportsReasoning: false },
  { id: "deepseek/deepseek-r1-distill-llama-70b:free", name: "DeepSeek R1 70B", shortName: "DeepSeek R1", provider: "DeepSeek", category: "Reasoning", supportsReasoning: true },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", shortName: "Llama 3.3", provider: "Meta", category: "General", supportsReasoning: false },
]

function getIcon(category) {
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
  const [zoom, setZoom] = useState(100)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setError(null)
        if (!window.pdfjsLib) {
          throw new Error('PDF.js not loaded')
        }
        
        const pdfjsLib = window.pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        setTotalPages(pdf.numPages)

        const loadedPages = []
        const maxPages = Math.min(pdf.numPages, 30)

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
        setError('Failed to load PDF')
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
        <p className="text-[#9B9B95]">{error || 'No PDF loaded'}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#1A1A1A]">
      <div className="border-b border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => handleZoom('out')} className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95]">
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-[#9B9B95] w-12 text-center">{zoom}%</span>
          <button onClick={() => handleZoom('in')} className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95]">
            <ZoomIn size={18} />
          </button>
        </div>
        <div className="text-sm text-[#6B6B65]">
          Page {currentPage} of {totalPages}
        </div>
        <button className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95]">
          <Download size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-[#0F0F0F] p-4 flex items-center justify-center">
        {pages[currentPage - 1] ? (
          <div
            className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => onPageClick && onPageClick(currentPage)}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <img src={pages[currentPage - 1].image} alt={`Page ${currentPage}`} className="w-full h-auto" />
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

        <div className="flex-1 overflow-x-auto mx-3 flex gap-2 pb-2">
          {pages.slice(0, Math.min(15, totalPages)).map((page, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`flex-shrink-0 h-12 w-10 rounded border-2 transition-all ${
                currentPage === idx + 1 ? 'border-[#CC785C] shadow-lg' : 'border-[#2E2E2E] hover:border-[#3A3A3A]'
              }`}
            >
              <img src={page.image} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover rounded" />
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#CC785C] flex items-center justify-center mr-2">
          <FileText size={16} className="text-white" />
        </div>
      )}
      <div className={`max-w-[85%] rounded-lg px-4 py-3 ${
        isUser ? 'bg-[#CC785C] text-white' : 'bg-[#2A2A2A] text-[#E5E5E0]'
      }`}>
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#3A3A3A] text-xs text-[#9B9B95] flex items-center gap-1">
            <BookOpen size={12} />
            <span className="font-semibold">Pages: </span>
            {message.citations.map((cite, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-[#3A3A3A] rounded">
                {cite}
              </span>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#3A3A3A] flex items-center justify-center ml-2">
          <MessageSquare size={16} className="text-[#E5E5E0]" />
        </div>
      )}
    </div>
  )
}

// Main Component
export default function StudyPDFInterface({ selectedModel: externalModel, onModelChange: externalOnModelChange }) {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfChunks, setPdfChunks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [processingPDF, setProcessingPDF] = useState(false)
  const [selectedModel, setSelectedModel] = useState(externalModel || MODELS[0].id)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (externalModel) {
      setSelectedModel(externalModel)
    }
  }, [externalModel])

  const handleModelChange = (model) => {
    setSelectedModel(model)
    if (externalOnModelChange) {
      externalOnModelChange(model)
    }
  }

  const chunkPDFContent = (pdfPages) => {
    const chunks = []
    const CHUNK_SIZE = 800
    const OVERLAP = 150

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

  const findRelevantChunks = (query, chunks, topK = 4) => {
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    
    const scoredChunks = chunks.map(chunk => {
      const chunkText = chunk.text.toLowerCase()
      let score = 0
      
      queryWords.forEach(word => {
        const matches = chunkText.match(new RegExp(word, 'g'))
        if (matches) score += matches.length
      })
      
      return { ...chunk, score }
    })

    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(c => c.score > 0)
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setProcessingPDF(true)
      const url = URL.createObjectURL(file)
      
      try {
        const buffer = await file.arrayBuffer()
        const pdfjsLib = window.pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
        const pdfPages = []
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const text = textContent.items.map(item => item.str || '').join(' ').trim()
          pdfPages.push({ pageNumber: i, text })
        }
        
        const chunks = chunkPDFContent(pdfPages)
        
        setPdfFile({ name: file.name, url, totalPages: pdf.numPages, pages: pdfPages })
        setPdfChunks(chunks)
        setMessages([])
        setInput('')
        setProcessingPDF(false)
      } catch (err) {
        console.error('Error processing PDF:', err)
        setProcessingPDF(false)
        alert('Failed to process PDF. Please try again.')
      }
    }
  }

  const callAPI = async (messagesArray) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messagesArray,
        model: selectedModel,
        stream: false,
        studyMode: false, // Set to false for PDF study
        analyzeFile: false // We already have the text extracted
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.content || 'No response received'
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !pdfFile || loading) return

    const userQuestion = input.trim()
    const userMessage = { role: 'user', content: userQuestion, isUser: true }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const relevantChunks = findRelevantChunks(userQuestion, pdfChunks, 4)
      
      const context = relevantChunks.length > 0
        ? relevantChunks.map(chunk => `[Page ${chunk.pageNumber}] ${chunk.text}`).join('\n\n')
        : pdfChunks.slice(0, 3).map(chunk => `[Page ${chunk.pageNumber}] ${chunk.text}`).join('\n\n')

      const citations = [...new Set(relevantChunks.map(c => c.pageNumber))]

      const prompt = `You are an intelligent PDF study assistant. Answer the following question based on the document context provided.

Document: ${pdfFile.name}

Context from document:
${context}

Question: ${userQuestion}

Instructions:
- Answer based only on the context provided
- Be specific and reference page numbers when applicable
- If the context doesn't contain enough information, state that clearly
- Be concise but thorough
- Format your answer in a clear, easy-to-read way`

      const content = await callAPI([{ role: 'user', content: prompt }])

      setMessages(prev => [...prev, {
        role: 'assistant',
        content,
        isUser: false,
        citations: citations.length > 0 ? citations : undefined
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error processing your question. ${error.message || 'Please try again.'}`,
        isUser: false
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSummarizePDF = async () => {
    if (!pdfFile || loading) return

    setMessages(prev => [...prev, { role: 'user', content: 'Summarize this entire document', isUser: true }])
    setLoading(true)

    try {
      const allText = pdfFile.pages
        .slice(0, 40)
        .map(p => `[Page ${p.pageNumber}] ${p.text}`)
        .join('\n\n')
        .slice(0, 35000)

      const prompt = `Provide a comprehensive summary of this document:

Document: ${pdfFile.name}
Total Pages: ${pdfFile.totalPages}

Content (first 40 pages):
${allText}

Create a well-structured summary with:
1. **Main Topic**: What is this document about?
2. **Key Sections**: What are the main parts or chapters?
3. **Important Points**: What are the critical takeaways?
4. **Conclusions**: What are the final thoughts or findings?

Format your response clearly with headers and bullet points.`

      const content = await callAPI([{ role: 'user', content: prompt }])
      setMessages(prev => [...prev, { role: 'assistant', content, isUser: false }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Failed to generate summary. ${error.message || 'Please try again.'}`, 
        isUser: false 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handlePageContext = async () => {
    if (!pdfFile || loading || currentPage < 1) return

    const pageData = pdfFile.pages[currentPage - 1]
    if (!pageData || !pageData.text || pageData.text.trim().length < 20) {
      setMessages(prev => [...prev, 
        { role: 'user', content: `Explain page ${currentPage}`, isUser: true },
        { role: 'assistant', content: 'This page appears to be empty or contains very little text content.', isUser: false }
      ])
      return
    }

    setMessages(prev => [...prev, { role: 'user', content: `Explain page ${currentPage}`, isUser: true }])
    setLoading(true)

    try {
      const prompt = `Explain the content of page ${currentPage} from "${pdfFile.name}":

[Page ${currentPage}]
${pageData.text}

Please provide:
1. **Main Topic**: What is this page about?
2. **Key Points**: What are the important details?
3. **Context**: How does this fit into the overall document?
4. **Summary**: Brief overview in simple terms

Be clear and concise.`

      const content = await callAPI([{ role: 'user', content: prompt }])
      setMessages(prev => [...prev, {
        role: 'assistant',
        content,
        isUser: false,
        citations: [currentPage]
      }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Failed to explain page ${currentPage}. ${error.message || 'Please try again.'}`, 
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

  const handlePageClick = (pageNum) => {
    // Optional: Auto-ask about the page when clicked
    console.log(`Clicked page ${pageNum}`)
  }

  if (processingPDF) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E1E1E]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#CC785C] mx-auto mb-4" />
          <p className="text-[#E5E5E0]">Processing PDF...</p>
        </div>
      </div>
    )
  }

  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1E1E1E]">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full bg-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
            <FileUp size={40} className="text-[#CC785C]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#E5E5E0] mb-2">Intelligent PDF Study</h2>
          <p className="text-[#9B9B95] mb-6">Upload a PDF and ask questions with AI-powered answers</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-[#CC785C] hover:bg-[#B8674A] text-white rounded-lg font-medium transition-colors"
          >
            Choose PDF File
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-[#1E1E1E] text-white overflow-hidden">
      <div className="w-1/2 flex flex-col border-r border-[#2E2E2E] overflow-hidden">
        <PDFViewer pdfUrl={pdfFile.url} currentPage={currentPage} setCurrentPage={setCurrentPage} onPageClick={handlePageClick} />
      </div>

      <div className="w-1/2 flex flex-col overflow-hidden">
        <div className="border-b border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex-1 min-w-0 mr-4">
            <p className="text-sm font-medium text-[#E5E5E0] truncate">{pdfFile.name}</p>
            <p className="text-xs text-[#6B6B65] mt-1">
              {pdfFile.totalPages} pages • {pdfChunks.length} chunks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} />
            <button
              onClick={() => {
                setPdfFile(null)
                setPdfChunks([])
                setMessages([])
                setInput('')
              }}
              className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95]"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="border-b border-[#2E2E2E] bg-[#1A1A1A] px-4 py-3 flex gap-2 flex-shrink-0 overflow-x-auto">
          <button
            onClick={handleSummarizePDF}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#E5E5E0] text-sm whitespace-nowrap transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles size={16} />
            Summarize
          </button>
          <button
            onClick={handlePageContext}
            disabled={loading}
            className="px-3 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] text-[#E5E5E0] text-sm whitespace-nowrap transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <BookOpen size={16} />
            Explain Page {currentPage}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Search className="w-12 h-12 text-[#6B6B65] mx-auto mb-4" />
                <p className="text-[#9B9B95] mb-2">Ask questions about your PDF</p>
                <p className="text-xs text-[#6B6B65]">AI-powered answers with page citations</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} isUser={msg.isUser} />
              ))}
              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#CC785C] flex items-center justify-center mr-2">
                    <FileText size={16} className="text-white" />
                  </div>
                  <div className="bg-[#2A2A2A] rounded-lg px-4 py-3">
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

        <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-4 flex-shrink-0">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document..."
              className="resize-none bg-[#2A2A2A] border border-[#2E2E2E] text-white placeholder-[#6B6B6B] focus:border-[#CC785C] focus:outline-none rounded-lg text-sm flex-1 px-3 py-2.5"
              rows={2}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-[#CC785C] hover:bg-[#B8674A] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center self-end"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowUp size={20} strokeWidth={2.5} />}
            </button>
          </div>
          <p className="text-xs text-[#6B6B65] mt-2">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}
