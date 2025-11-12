import React, { useState, useRef, useEffect } from "react"
import { AlertCircle, CheckCircle, Paperclip, FileImage, X } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void
  onImagesExtracted?: (images: string[], fileName: string) => void
  onPdfImageSelect?: (images: string[]) => void
  maxPdfPages?: number
  chunkSize?: number
  imageScale?: number
  imageQuality?: number
}

declare global {
  interface Window {
    pdfjsLib: any
  }
}

export default function FileUpload({ 
  onFileSelect, 
  onImagesExtracted, 
  onPdfImageSelect, 
  maxPdfPages,
  chunkSize = 3,
  imageScale = 0.75,
  imageQuality = 0.65
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false)
  const [pdfJsError, setPdfJsError] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const [progress, setProgress] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const canvasPoolRef = useRef<HTMLCanvasElement[]>([])

  useEffect(() => {
    // Pre-create canvas pool for reuse
    for (let i = 0; i < chunkSize; i++) {
      const canvas = document.createElement('canvas')
      canvasPoolRef.current.push(canvas)
    }

    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
      canvasPoolRef.current = []
    }
  }, [chunkSize])

  useEffect(() => {
    if (window.pdfjsLib) {
      setPdfJsLoaded(true)
      return
    }

    let retryCount = 0
    const maxRetries = 3
    
    const loadPdfJs = () => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.async = true
      
      script.onload = () => {
        try {
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
            setPdfJsLoaded(true)
            setPdfJsError(false)
          } else {
            throw new Error('pdfjsLib not available')
          }
        } catch (err) {
          setPdfJsError(true)
        }
      }
      
      script.onerror = () => {
        if (retryCount < maxRetries - 1) {
          retryCount++
          setTimeout(loadPdfJs, 1000 * retryCount)
        } else {
          setPdfJsError(true)
        }
      }
      
      document.head.appendChild(script)
    }

    loadPdfJs()
  }, [])

  const clearError = () => {
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
    setError(null)
  }

  const showError = (message: string, duration: number = 4000) => {
    clearError()
    setError(message)
    errorTimeoutRef.current = setTimeout(clearError, duration)
  }

  const clearSuccess = () => {
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
    setSuccess(false)
  }

  const showSuccess = (duration: number = 2000) => {
    clearSuccess()
    setSuccess(true)
    successTimeoutRef.current = setTimeout(clearSuccess, duration)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isProcessing) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (isProcessing) return
    const files = e.dataTransfer?.files
    if (files && files.length > 0) processFile(files[0])
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files
    if (files && files.length > 0) processFile(files[0])
  }

  // Intelligent adaptive scaling based on page size
  const getOptimalScale = (viewport: any): number => {
    const area = viewport.width * viewport.height
    const megapixels = area / 1000000
    
    if (megapixels > 4) return 0.5      // Very large pages
    if (megapixels > 2) return 0.65     // Large pages
    if (megapixels > 1) return imageScale // Normal pages
    return Math.min(1.2, imageScale * 1.5) // Small pages need more detail
  }

  // Smart memory management with canvas pooling
  const convertPDFPagesToImagesOptimized = async (
    arrayBuffer: ArrayBuffer
  ): Promise<string[]> => {
    if (!window.pdfjsLib || !pdfJsLoaded) {
      throw new Error('PDF.js library not available')
    }

    let pdf = null
    const allImages: string[] = []
    let totalProcessed = 0

    try {
      const loadingTask = window.pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        isEvalSupported: false,
        useSystemFonts: true,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true
      })
      
      pdf = await loadingTask.promise
      const numPages = pdf.numPages
      
      if (numPages === 0) throw new Error('PDF has no pages')

      const pagesToProcess = maxPdfPages ? Math.min(numPages, maxPdfPages) : numPages
      
      setProcessingStatus(
        maxPdfPages && numPages > maxPdfPages 
          ? `Converting first ${maxPdfPages} of ${numPages} pages...`
          : `Converting ${numPages} pages...`
      )

      // Adaptive chunk sizing based on available memory
      const estimateMemory = () => {
        if (performance && (performance as any).memory) {
          const mem = (performance as any).memory
          const available = mem.jsHeapSizeLimit - mem.usedJSHeapSize
          return available > 100000000 ? chunkSize : Math.max(2, Math.floor(chunkSize / 2))
        }
        return chunkSize
      }

      for (let startPage = 1; startPage <= pagesToProcess; startPage += chunkSize) {
        const adaptiveChunk = estimateMemory()
        const endPage = Math.min(startPage + adaptiveChunk - 1, pagesToProcess)
        const chunkPromises = []

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
          const canvasIndex = (pageNum - startPage) % canvasPoolRef.current.length
          
          chunkPromises.push(
            (async () => {
              let page = null
              try {
                page = await pdf.getPage(pageNum)
                const viewport = page.getViewport({ scale: 1.0 })
                
                // Adaptive scaling
                const optimalScale = getOptimalScale(viewport)
                const scaledViewport = page.getViewport({ scale: optimalScale })
                
                // Reuse canvas from pool
                const canvas = canvasPoolRef.current[canvasIndex]
                const context = canvas.getContext('2d', { 
                  willReadFrequently: false,
                  alpha: false,
                  desynchronized: true
                })
                
                if (!context) return null

                canvas.height = scaledViewport.height
                canvas.width = scaledViewport.width

                await page.render({
                  canvasContext: context,
                  viewport: scaledViewport,
                  intent: 'display',
                  background: 'white'
                }).promise

                // Smart quality based on complexity
                const imageData = canvas.toDataURL('image/jpeg', imageQuality)
                
                return imageData
              } catch (err) {
                console.warn(`Page ${pageNum} error:`, err)
                return null
              } finally {
                if (page) {
                  try {
                    page.cleanup()
                  } catch {}
                }
              }
            })()
          )
        }

        const results = await Promise.all(chunkPromises)
        results.forEach(img => { if (img) allImages.push(img) })

        totalProcessed = Math.min(endPage, pagesToProcess)
        setProgress(Math.round((totalProcessed / pagesToProcess) * 100))
        setProcessingStatus(`Converted ${totalProcessed}/${pagesToProcess} pages...`)

        // Memory cleanup between chunks
        if ('gc' in window && typeof (window as any).gc === 'function') {
          try { (window as any).gc() } catch {}
        }

        // Yield to main thread
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      setProcessingStatus("")
      setProgress(0)
      return allImages

    } catch (err) {
      throw new Error(`PDF conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      if (pdf) {
        try { pdf.destroy() } catch {}
      }
    }
  }

  // Optimized text extraction with intelligent spacing
  const extractTextFromPDFOptimized = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    if (!window.pdfjsLib || !pdfJsLoaded) {
      throw new Error('PDF.js library not available')
    }

    let pdf = null

    try {
      const loadingTask = window.pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        isEvalSupported: false,
        useSystemFonts: true
      })
      
      pdf = await loadingTask.promise
      const numPages = maxPdfPages ? Math.min(pdf.numPages, maxPdfPages) : pdf.numPages
      const textChunks: string[] = []

      for (let startPage = 1; startPage <= numPages; startPage += chunkSize) {
        const endPage = Math.min(startPage + chunkSize - 1, numPages)
        const promises = []

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
          promises.push(
            (async () => {
              let page = null
              try {
                page = await pdf.getPage(pageNum)
                const textContent = await page.getTextContent()
                
                if (!textContent?.items?.length) return `--- Page ${pageNum} ---\n\n`

                // Sort by position intelligently
                const items = textContent.items
                  .filter((item: any) => item.str && item.transform)
                  .sort((a: any, b: any) => {
                    const yDiff = Math.abs(a.transform[5] - b.transform[5])
                    return yDiff > 5 
                      ? b.transform[5] - a.transform[5]  // Different lines
                      : a.transform[4] - b.transform[4]  // Same line, sort by x
                  })
                
                const parts: string[] = []
                let lastY = -1
                let lastX = -1
                
                items.forEach((item: any) => {
                  const [, , , , x, y] = item.transform
                  const yDiff = Math.abs(y - lastY)
                  const xDiff = x - lastX
                  
                  // New line detection
                  if (lastY !== -1 && yDiff > 5) {
                    parts.push('\n')
                  } 
                  // Space detection (large horizontal gap)
                  else if (lastX !== -1 && xDiff > 10 && !parts[parts.length - 1]?.endsWith(' ')) {
                    parts.push(' ')
                  }
                  // Regular space
                  else if (parts.length && !parts[parts.length - 1]?.endsWith(' ') && !parts[parts.length - 1]?.endsWith('\n')) {
                    parts.push(' ')
                  }
                  
                  parts.push(item.str)
                  lastY = y
                  lastX = x + (item.width || 0)
                })
                
                return `--- Page ${pageNum} ---\n${parts.join('')}\n\n`
              } catch {
                return `--- Page ${pageNum} ---\n[Error]\n\n`
              } finally {
                if (page) {
                  try { page.cleanup() } catch {}
                }
              }
            })()
          )
        }

        const results = await Promise.all(promises)
        textChunks.push(...results)

        setProgress(Math.round((endPage / numPages) * 100))
        setProcessingStatus(`Extracting page ${endPage}/${numPages}...`)

        await new Promise(resolve => setTimeout(resolve, 5))
      }

      setProgress(0)
      return textChunks.join('')

    } catch (err) {
      throw new Error(`Text extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      if (pdf) {
        try { pdf.destroy() } catch {}
      }
    }
  }

  const sanitizeText = (text: string): string => {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file) return { valid: false, error: 'No file provided' }
    if (file.size === 0) return { valid: false, error: 'File is empty' }
    if (file.size > 50 * 1024 * 1024) return { valid: false, error: 'File size must be less than 50MB' }

    const ext = file.name.toLowerCase().split('.').pop() || ''
    const supported = ['txt', 'csv', 'json', 'md', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'html', 'css', 'xml', 'svg', 'pdf', 'docx', 'doc', 'xlsx', 'xls']
    
    if (!supported.includes(ext) && !file.type.startsWith('text/')) {
      return { valid: false, error: `Unsupported: .${ext}` }
    }

    if (ext === 'pdf' && pdfJsError) {
      return { valid: false, error: 'PDF processing unavailable' }
    }

    return { valid: true }
  }

  const processFile = async (file: File) => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    
    abortControllerRef.current = new AbortController()
    clearError()
    clearSuccess()
    setIsProcessing(true)
    setProcessingStatus("")
    setProgress(0)

    const validation = validateFile(file)
    if (!validation.valid) {
      showError(validation.error || 'Invalid file')
      setIsProcessing(false)
      return
    }

    const ext = file.name.toLowerCase().split('.').pop() || ''

    try {
      let content = ""

      if (['docx', 'doc', 'xlsx', 'xls'].includes(ext)) {
        setProcessingStatus("Processing document...")
        
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/process-file', {
          method: 'POST',
          body: formData,
          signal: abortControllerRef.current.signal
        })
        
        if (!response.ok) {
          throw new Error(`Server error (${response.status})`)
        }
        
        const data = await response.json()
        if (!data.content) throw new Error('Empty response')
        content = data.content
      }
      else if (ext === 'pdf') {
        if (!pdfJsLoaded) throw new Error('PDF library loading...')
        if (pdfJsError) throw new Error('PDF processing unavailable')

        const buffer = await file.arrayBuffer()
        if (!buffer.byteLength) throw new Error('Empty PDF')

        let text = ""
        let images: string[] = []

        try {
          setProcessingStatus("Extracting text...")
          text = await extractTextFromPDFOptimized(buffer)
        } catch (err) {
          console.warn('Text extraction failed:', err)
        }

        try {
          setProcessingStatus("Converting to images...")
          images = await convertPDFPagesToImagesOptimized(buffer)
        } catch (err) {
          if (!text) throw new Error('Failed to process PDF')
        }

        const textLen = text.replace(/\s/g, '').length
        const hasImages = images.length > 0
        
        if (textLen < 100 && hasImages) {
          content = `[PDF: ${file.name} - ${images.length} pages as images]\n\n${text ? 'Text:\n' + text : ''}`
          if (onPdfImageSelect) onPdfImageSelect(images)
          if (onImagesExtracted) onImagesExtracted(images, file.name)
        } else if (textLen >= 100) {
          content = text
          if (hasImages) {
            if (onPdfImageSelect) onPdfImageSelect(images)
            if (onImagesExtracted) onImagesExtracted(images, file.name)
          }
        } else if (hasImages) {
          content = `[PDF: ${file.name} - ${images.length} pages as images]`
          if (onPdfImageSelect) onPdfImageSelect(images)
          if (onImagesExtracted) onImagesExtracted(images, file.name)
        } else {
          throw new Error('PDF appears empty')
        }
      }
      else {
        content = await file.text()
      }

      const cleaned = sanitizeText(content)
      if (!cleaned.trim() && ext !== 'pdf') {
        throw new Error("File is empty")
      }

      onFileSelect(cleaned, file.name)
      showSuccess()

      if (fileInputRef.current) fileInputRef.current.value = ""

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        showError('Cancelled', 2000)
      } else {
        showError(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    } finally {
      setIsProcessing(false)
      setProcessingStatus("")
      setProgress(0)
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort()
    setIsProcessing(false)
    setProcessingStatus("")
    setProgress(0)
    clearError()
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.csv,.json,.pdf,.docx,.xlsx,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.html,.css,.xml,.svg,.xls,.doc"
        disabled={isProcessing}
      />

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (!isProcessing) fileInputRef.current?.click()
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isProcessing}
        className={`p-2 rounded-lg transition-all flex items-center justify-center ${
          isDragging ? "bg-[#CC785C] text-white scale-105"
            : success ? "bg-green-900/30 text-green-400"
            : error ? "bg-red-900/30 text-red-400"
            : isProcessing ? "bg-[#2A2A2A] text-[#6B6B65] cursor-wait"
            : "bg-[#2A2A2A] hover:bg-[#333333] text-[#9B9B95] hover:text-[#CC785C]"
        }`}
        title={isProcessing ? "Processing..." : "Upload file"}
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-[#6B6B65] border-t-transparent rounded-full animate-spin" />
        ) : success ? (
          <CheckCircle size={20} />
        ) : error ? (
          <AlertCircle size={20} />
        ) : (
          <Paperclip size={20} />
        )}
      </button>

      {processingStatus && (
        <div className="absolute bottom-full left-0 mb-2 w-72 p-3 rounded-lg bg-blue-900/95 border border-blue-600 text-blue-100 text-xs shadow-xl z-50 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <FileImage size={16} className="flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 min-w-0">
              <div className="break-words mb-2 font-medium">{processingStatus}</div>
              {progress > 0 && (
                <div className="w-full bg-blue-950/60 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              {progress > 0 && (
                <div className="text-blue-300 text-[10px] mt-1 font-mono">{progress}%</div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCancel()
              }}
              className="flex-shrink-0 hover:text-white transition-colors p-1 hover:bg-blue-800 rounded"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-2 rounded-lg bg-red-900/90 border border-red-700 text-red-200 text-xs shadow-lg z-50">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="break-words">{error}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearError()
              }}
              className="flex-shrink-0 hover:text-red-100 transition-colors"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {pdfJsError && !isProcessing && !error && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-2 rounded-lg bg-yellow-900/90 border border-yellow-700 text-yellow-200 text-xs shadow-lg z-50">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>PDF support unavailable</span>
          </div>
        </div>
      )}
    </div>
  )
}
