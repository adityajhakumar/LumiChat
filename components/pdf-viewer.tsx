'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from 'lucide-react'

interface PDFViewerProps {
  pdfUrl: string
  onPageSelect: (pageNumber: number, pageText: string) => void
  selectedPage?: number
}

export default function PDFViewer({ pdfUrl, onPageSelect, selectedPage }: PDFViewerProps) {
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [pages, setPages] = useState<{ image: string; text: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setError(null)
        if (!window.pdfjsLib) {
          throw new Error('PDF.js not loaded')
        }
        
        const pdfjsLib = window.pdfjsLib
        // Set worker using already loaded library
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        setTotalPages(pdf.numPages)

        const loadedPages: { image: string; text: string }[] = []

        // Load first 20 pages for performance
        for (let i = 1; i <= Math.min(pdf.numPages, 200); i++) {
          const page = await pdf.getPage(i)
          
          const textContent = await page.getTextContent()
          const text = textContent.items
            .map((item: any) => item.str || '')
            .join(' ')
            .trim()

          // Render page as image
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          const viewport = page.getViewport({ scale: 1.5 })
          
          if (context) {
            canvas.height = viewport.height
            canvas.width = viewport.width

            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise
            
            loadedPages.push({
              image: canvas.toDataURL('image/png'),
              text: text || `Page ${i} content`,
            })
          }
        }

        setPages(loadedPages)
        setLoading(false)
      } catch (error) {
        console.error('Error loading PDF:', error)
        setError('Failed to load PDF. Please try again.')
        setLoading(false)
      }
    }

    if (pdfUrl) {
      loadPdf()
    }
  }, [pdfUrl])

  const handlePageClick = (pageNum: number) => {
    setCurrentPage(pageNum)
    const pageContent = pages[pageNum - 1]
    onPageSelect(pageNum, pageContent?.text || `Page ${pageNum}`)
  }

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoom < 200) {
      setZoom(zoom + 25)
    } else if (direction === 'out' && zoom > 50) {
      setZoom(zoom - 25)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1A1A1A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CC785C] mx-auto mb-4"></div>
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
      {/* PDF Toolbar */}
      <div className="border-b border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom('out')}
            className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95]"
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-sm text-[#9B9B95] w-12 text-center">{zoom}%</span>
          <button
            onClick={() => handleZoom('in')}
            className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95]"
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
        </div>
        <div className="text-sm text-[#6B6B65]">
          Page {currentPage} of {totalPages}
        </div>
        <button
          className="p-2 hover:bg-[#2A2A2A] rounded transition-colors text-[#9B9B95]"
          title="Download"
        >
          <Download size={18} />
        </button>
      </div>

      {/* PDF Page Display */}
      <div className="flex-1 overflow-auto bg-[#0F0F0F] p-4 flex items-center justify-center">
        {pages[currentPage - 1] ? (
          <div
            className="bg-white shadow-lg rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handlePageClick(currentPage)}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            <img
              src={pages[currentPage - 1].image || "/placeholder.svg"}
              alt={`Page ${currentPage}`}
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="text-[#9B9B95]">Loading page...</div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-[#9B9B95]"
          title="Previous page"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Page Thumbnails */}
        <div className="flex-1 overflow-x-auto mx-3 flex gap-2 pb-2">
          {pages.slice(0, Math.min(10, totalPages)).map((page, idx) => (
            <button
              key={idx}
              onClick={() => {
                const pageNum = idx + 1
                setCurrentPage(pageNum)
                handlePageClick(pageNum)
              }}
              className={`flex-shrink-0 h-12 w-10 rounded border-2 transition-all ${
                selectedPage === idx + 1
                  ? 'border-[#CC785C] shadow-lg'
                  : 'border-[#2E2E2E] hover:border-[#3A3A3A]'
              }`}
            >
              <img
                src={page.image || "/placeholder.svg"}
                alt={`Thumb ${idx + 1}`}
                className="w-full h-full object-cover rounded"
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors text-[#9B9B95]"
          title="Next page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
