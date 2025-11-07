import React, { useState, useRef, useEffect } from "react"
import { AlertCircle, CheckCircle, Paperclip, FileImage, X } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void
  onImagesExtracted?: (images: string[], fileName: string) => void
  onPdfImageSelect?: (images: string[]) => void
  maxPdfPages?: number // Optional limit, defaults to unlimited
}

declare global {
  interface Window {
    pdfjsLib: any
  }
}

export default function FileUpload({ onFileSelect, onImagesExtracted, onPdfImageSelect, maxPdfPages }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false)
  const [pdfJsError, setPdfJsError] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [])

  // Load PDF.js library with retry mechanism
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
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current)
    }
    setError(null)
  }

  const showError = (message: string, duration: number = 4000) => {
    clearError()
    setError(message)
    errorTimeoutRef.current = setTimeout(clearError, duration)
  }

  const clearSuccess = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
    }
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
    if (!isProcessing) {
      setIsDragging(true)
    }
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
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const convertPDFPagesToImages = async (arrayBuffer: ArrayBuffer): Promise<string[]> => {
    if (!window.pdfjsLib || !pdfJsLoaded) {
      throw new Error('PDF.js library not available')
    }

    let pdf = null
    const images: string[] = []

    try {
      const loadingTask = window.pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0
      })
      
      pdf = await loadingTask.promise
      const numPages = pdf.numPages
      
      if (numPages === 0) {
        throw new Error('PDF has no pages')
      }

      // Apply page limit if specified, otherwise process all pages
      const pagesToProcess = maxPdfPages ? Math.min(numPages, maxPdfPages) : numPages
      
      if (maxPdfPages && numPages > maxPdfPages) {
        setProcessingStatus(`Converting first ${maxPdfPages} of ${numPages} pages...`)
      } else {
        setProcessingStatus(`Converting ${numPages} pages...`)
      }

      for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
        try {
          setProcessingStatus(`Processing page ${pageNum}/${pagesToProcess}...`)
          
          const page = await pdf.getPage(pageNum)
          const viewport = page.getViewport({ scale: 2.0 })
          
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d', { willReadFrequently: false })
          
          if (!context) {
            console.error(`Failed to get canvas context for page ${pageNum}`)
            continue
          }

          canvas.height = viewport.height
          canvas.width = viewport.width

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise

          const imageData = canvas.toDataURL('image/jpeg', 0.85)
          images.push(imageData)
          
          page.cleanup()
        } catch (pageErr) {
          console.warn(`Error processing page ${pageNum}:`, pageErr)
        }
      }

      setProcessingStatus("")
      return images

    } catch (err) {
      throw new Error(`PDF conversion failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      if (pdf) {
        try {
          pdf.destroy()
        } catch (cleanupErr) {
          // Silent cleanup
        }
      }
    }
  }

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    if (!window.pdfjsLib || !pdfJsLoaded) {
      throw new Error('PDF.js library not available')
    }

    let pdf = null

    try {
      const loadingTask = window.pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0
      })
      
      pdf = await loadingTask.promise
      
      // Apply page limit if specified, otherwise process all pages
      const numPages = maxPdfPages ? Math.min(pdf.numPages, maxPdfPages) : pdf.numPages
      let fullText = ''

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          setProcessingStatus(`Extracting text from page ${pageNum}/${numPages}...`)
          
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          
          if (!textContent?.items || textContent.items.length === 0) {
            page.cleanup()
            continue
          }

          const sortedItems = textContent.items
            .filter((item: any) => item.str && item.transform)
            .sort((a: any, b: any) => {
              const yDiff = Math.abs(a.transform[5] - b.transform[5])
              if (yDiff > 5) {
                return b.transform[5] - a.transform[5]
              }
              return a.transform[4] - b.transform[4]
            })
          
          let lastY = -1
          let pageText = ''
          
          sortedItems.forEach((item: any) => {
            try {
              const currentY = item.transform[5]
              
              if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
                pageText += '\n'
              }
              
              if (item.str && pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
                pageText += ' '
              }
              
              pageText += item.str
              lastY = currentY
            } catch (itemErr) {
              console.warn('Error processing text item:', itemErr)
            }
          })
          
          fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`
          
          page.cleanup()
          
        } catch (pageErr) {
          // Silent fail - continue with other pages
        }
      }

      return fullText.trim()

    } catch (err) {
      throw new Error(`Text extraction failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      if (pdf) {
        try {
          pdf.destroy()
        } catch (cleanupErr) {
          // Silent cleanup
        }
      }
    }
  }

  const sanitizeText = (text: string): string => {
    try {
      return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    } catch (err) {
      return text
    }
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: 'No file provided' }
    }

    if (file.size === 0) {
      return { valid: false, error: 'File is empty' }
    }

    if (file.size > 50 * 1024 * 1024) {
      return { valid: false, error: 'File size must be less than 50MB' }
    }

    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop() || ''
    
    const supportedExtensions = [
      'txt', 'csv', 'json', 'md', 
      'js', 'ts', 'jsx', 'tsx', 
      'py', 'java', 'cpp', 'c', 'h',
      'html', 'css', 'xml', 'svg',
      'pdf', 'docx', 'doc', 
      'xlsx', 'xls'
    ]
    
    if (!supportedExtensions.includes(fileExtension) && !file.type.startsWith('text/')) {
      return { 
        valid: false, 
        error: `Unsupported file type: .${fileExtension}. Supported: ${supportedExtensions.join(', ')}` 
      }
    }

    if (fileExtension === 'pdf' && pdfJsError) {
      return { 
        valid: false, 
        error: 'PDF processing unavailable. Please try a text-based file format.' 
      }
    }

    return { valid: true }
  }

  const processFile = async (file: File) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    clearError()
    clearSuccess()
    setIsProcessing(true)
    setProcessingStatus("")

    const validation = validateFile(file)
    if (!validation.valid) {
      showError(validation.error || 'Invalid file')
      setIsProcessing(false)
      return
    }

    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop() || ''

    try {
      let content = ""

      if (['docx', 'doc', 'xlsx', 'xls'].includes(fileExtension)) {
        setProcessingStatus("Processing document...")
        
        const formData = new FormData()
        formData.append('file', file)
        
        try {
          const response = await fetch('/api/process-file', {
            method: 'POST',
            body: formData,
            signal: abortControllerRef.current.signal
          })
          
          if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error')
            throw new Error(`Server error (${response.status}): ${errorText}`)
          }
          
          const data = await response.json()
          
          if (!data.content) {
            throw new Error('Server returned empty content')
          }
          
          content = data.content
          
        } catch (fetchErr) {
          if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
            throw new Error('Upload cancelled')
          }
          throw new Error(`Failed to process ${fileExtension.toUpperCase()}: ${fetchErr instanceof Error ? fetchErr.message : 'Server unavailable'}`)
        }
      }
      else if (fileExtension === 'pdf') {
        if (!pdfJsLoaded) {
          throw new Error('PDF library is still loading. Please wait a moment and try again.')
        }

        if (pdfJsError) {
          throw new Error('PDF processing unavailable. Please try again or use a different file format.')
        }

        const originalBuffer = await file.arrayBuffer()
        
        if (originalBuffer.byteLength === 0) {
          throw new Error('PDF file is empty or corrupted')
        }

        let extractedText = ""
        let images: string[] = []

        try {
          const textBuffer = originalBuffer.slice(0)
          setProcessingStatus("Extracting text from PDF...")
          extractedText = await extractTextFromPDF(textBuffer)
        } catch (textErr) {
          // Continue to image conversion silently
        }

        try {
          const imageBuffer = originalBuffer.slice(0)
          images = await convertPDFPagesToImages(imageBuffer)
        } catch (imgErr) {
          if (!extractedText) {
            throw new Error('Failed to process PDF: Could not extract text or convert pages to images')
          }
        }

        const textLength = extractedText.replace(/\s/g, '').length
        const hasImages = images.length > 0
        
        if (textLength < 100 && hasImages) {
          content = `[PDF: ${file.name} - ${images.length} pages converted to images for visual analysis]\n\n${extractedText ? 'Minimal text extracted:\n' + extractedText : ''}`
          
          if (onPdfImageSelect) onPdfImageSelect(images)
          if (onImagesExtracted) onImagesExtracted(images, file.name)
          
        } else if (textLength >= 100) {
          content = extractedText
          
          if (hasImages) {
            if (onPdfImageSelect) onPdfImageSelect(images)
            if (onImagesExtracted) onImagesExtracted(images, file.name)
          }
          
        } else if (hasImages) {
          content = `[PDF: ${file.name} - ${images.length} pages converted to images for visual analysis]`
          if (onPdfImageSelect) onPdfImageSelect(images)
          if (onImagesExtracted) onImagesExtracted(images, file.name)
          
        } else {
          throw new Error('PDF appears to be empty or unreadable')
        }
      }
      else {
        try {
          content = await file.text()
        } catch (readErr) {
          throw new Error(`Failed to read file: ${readErr instanceof Error ? readErr.message : 'Unknown error'}`)
        }
      }

      const sanitizedContent = sanitizeText(content)

      if (!sanitizedContent.trim() && fileExtension !== 'pdf') {
        throw new Error("File is empty or contains no readable text")
      }

      onFileSelect(sanitizedContent, file.name)
      showSuccess()

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

    } catch (err) {
      
      if (err instanceof Error && err.name === 'AbortError') {
        showError('Upload cancelled', 2000)
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
        showError(`Failed to process file: ${errorMessage}`)
      }
      
    } finally {
      setIsProcessing(false)
      setProcessingStatus("")
      abortControllerRef.current = null
    }
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsProcessing(false)
    setProcessingStatus("")
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
          if (!isProcessing) {
            fileInputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        disabled={isProcessing}
        className={`p-2 rounded-lg transition-all flex items-center justify-center ${
          isDragging
            ? "bg-[#CC785C] text-white scale-105"
            : success
              ? "bg-green-900/30 text-green-400"
              : error
                ? "bg-red-900/30 text-red-400"
                : isProcessing
                  ? "bg-[#2A2A2A] text-[#6B6B65] cursor-wait"
                  : "bg-[#2A2A2A] hover:bg-[#333333] text-[#9B9B95] hover:text-[#CC785C]"
        }`}
        title={isProcessing ? "Processing..." : "Upload file (TXT, CSV, JSON, PDF, DOCX, XLSX, code files)"}
        aria-label={isProcessing ? "Processing file" : "Upload file"}
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
        <div className="absolute bottom-full left-0 mb-2 w-64 p-2 rounded-lg bg-blue-900/90 border border-blue-700 text-blue-200 text-xs shadow-lg z-50">
          <div className="flex items-start gap-2">
            <FileImage size={14} className="flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 min-w-0">
              <span className="break-words">{processingStatus}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCancel()
              }}
              className="flex-shrink-0 hover:text-blue-100 transition-colors"
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
