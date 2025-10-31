"use client"

import React, { useState, useRef, useEffect } from "react"
import { AlertCircle, CheckCircle, Paperclip } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void
}

declare global {
  interface Window {
    pdfjsLib: any
  }
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load PDF.js library
    if (!window.pdfjsLib) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.async = true
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
          setPdfJsLoaded(true)
          console.log('PDF.js loaded successfully')
        }
      }
      script.onerror = () => {
        console.error('Failed to load PDF.js')
        setPdfJsLoaded(false)
      }
      document.head.appendChild(script)
    } else {
      setPdfJsLoaded(true)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
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
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const extractTextFromPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    try {
      if (!window.pdfjsLib || !pdfJsLoaded) {
        throw new Error('PDF.js not loaded')
      }

      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const maxPages = pdf.numPages
      let fullText = ''

      console.log(`PDF has ${maxPages} pages`)

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        let lastY = -1
        let pageText = ''
        
        textContent.items.forEach((item: any) => {
          const currentY = item.transform[5]
          
          if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
            pageText += '\n'
          }
          
          if (item.str && pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
            pageText += ' '
          }
          
          pageText += item.str
          lastY = currentY
        })
        
        fullText += pageText + '\n\n'
      }

      return fullText.trim()
    } catch (err) {
      console.error('PDF.js extraction error:', err)
      throw err
    }
  }

  const sanitizeText = (text: string): string => {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
  }

  const processFile = async (file: File) => {
    console.log("Processing file:", file.name, "Type:", file.type, "Size:", file.size)
    
    setError(null)
    setSuccess(false)
    setIsProcessing(true)

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      setIsProcessing(false)
      setTimeout(() => setError(null), 3000)
      return
    }

    const fileName = file.name.toLowerCase()
    const fileExtension = fileName.split('.').pop() || ''
    
    const supportedExtensions = ['txt', 'csv', 'json', 'md', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'xml', 'pdf', 'docx', 'doc', 'xlsx', 'xls']
    
    if (!supportedExtensions.includes(fileExtension) && !file.type.startsWith('text/')) {
      setError(`Unsupported file type: .${fileExtension}`)
      setIsProcessing(false)
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      let content = ""

      // Handle DOCX and XLSX via server-side API
      if (['docx', 'doc', 'xlsx', 'xls'].includes(fileExtension)) {
        const formData = new FormData()
        formData.append('file', file)
        
        const response = await fetch('/api/process-file', {
          method: 'POST',
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }
        
        const data = await response.json()
        content = data.content
        console.log(`${fileExtension.toUpperCase()} content extracted via API, length:`, content.length)
      }
      // Handle PDF client-side (using PDF.js)
      else if (fileExtension === 'pdf') {
        if (!pdfJsLoaded) {
          setError("PDF library is still loading. Please try again in a moment.")
          setIsProcessing(false)
          setTimeout(() => setError(null), 3000)
          return
        }

        const arrayBuffer = await file.arrayBuffer()
        const extractedText = await extractTextFromPDF(arrayBuffer)
        
        if (extractedText && extractedText.length > 50) {
          content = extractedText
          console.log("PDF text extracted successfully, length:", extractedText.length)
        } else {
          throw new Error("No text content found in PDF")
        }
      }
      // Handle text files client-side
      else {
        content = await file.text()
        console.log("Text file content read, length:", content.length)
      }

      const sanitizedContent = sanitizeText(content)

      if (sanitizedContent.trim()) {
        onFileSelect(sanitizedContent, file.name)
        setSuccess(true)
        console.log("File uploaded successfully:", file.name)
        setTimeout(() => setSuccess(false), 2000)
      } else {
        throw new Error("File is empty or could not be read")
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      console.error("File processing error:", err)
      setError(`Failed to process ${fileExtension.toUpperCase()}. ${err instanceof Error ? err.message : 'Please try again.'}`)
      setTimeout(() => setError(null), 4000)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.csv,.json,.pdf,.docx,.xlsx,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.xml,.xls,.doc"
      />

      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          fileInputRef.current?.click()
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
        title="Upload file (TXT, CSV, JSON, PDF, DOCX, XLSX, code files)"
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

      {error && (
        <div className="absolute bottom-full left-0 mb-2 w-64 p-2 rounded-lg bg-red-900/90 border border-red-700 text-red-200 text-xs shadow-lg z-50">
          <div className="flex items-start gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
