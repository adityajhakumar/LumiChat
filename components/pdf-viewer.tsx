import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw, Maximize2, Search, FileText, AlertCircle, Loader2 } from 'lucide-react'

interface PDFViewerProps {
  pdfUrl: string
  onPageSelect?: (pageNumber: number, pageText: string) => void
  selectedPage?: number
  className?: string
}

interface PageData {
  image: string
  text: string
  thumbnail: string
  pageNumber: number
}

const ZOOM_LEVELS = [25, 50, 75, 100, 125, 150, 200, 300, 400]
const INITIAL_ZOOM = 100
const THUMBNAIL_SCALE = 0.3
const PAGE_RENDER_SCALE = 2

export default function PDFViewer({ 
  pdfUrl, 
  onPageSelect, 
  selectedPage,
  className = '' 
}: PDFViewerProps) {
  // Core state
  const [pdf, setPdf] = useState<any>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [rotation, setRotation] = useState(0)
  
  // Page cache
  const [pageCache, setPageCache] = useState<Map<number, PageData>>(new Map())
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set([1]))
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [showThumbnails, setShowThumbnails] = useState(false)
  
  // Performance
  const [renderQueue, setRenderQueue] = useState<number[]>([])
  const [isRendering, setIsRendering] = useState(false)
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRenderRef = useRef<Map<number, boolean>>(new Map())
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load PDF Document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setError(null)
        setLoading(true)
        
        if (!window.pdfjsLib) {
          throw new Error('PDF.js library not loaded. Please include the script in your HTML.')
        }
        
        const pdfjsLib = window.pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        
        // Create abort controller for cleanup
        abortControllerRef.current = new AbortController()
        
        const loadingTask = pdfjsLib.getDocument(pdfUrl)
        const pdfDoc = await loadingTask.promise
        
        setPdf(pdfDoc)
        setTotalPages(pdfDoc.numPages)
        setCurrentPage(selectedPage || 1)
        
        // Pre-render first page
        await renderPage(pdfDoc, selectedPage || 1)
        
        setLoading(false)
      } catch (err: any) {
        console.error('Error loading PDF:', err)
        setError(err.message || 'Failed to load PDF. Please check the file and try again.')
        setLoading(false)
      }
    }

    if (pdfUrl) {
      loadPdf()
    }

    return () => {
      abortControllerRef.current?.abort()
    }
  }, [pdfUrl])

  // Render a single page
  const renderPage = useCallback(async (pdfDoc: any, pageNum: number): Promise<PageData | null> => {
    try {
      // Check if already rendering
      if (pageRenderRef.current.get(pageNum)) {
        return null
      }
      
      // Check cache
      if (pageCache.has(pageNum)) {
        return pageCache.get(pageNum)!
      }

      pageRenderRef.current.set(pageNum, true)
      
      const page = await pdfDoc.getPage(pageNum)
      
      // Extract text
      const textContent = await page.getTextContent()
      const text = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .trim()

      // Render full resolution page
      const viewport = page.getViewport({ scale: PAGE_RENDER_SCALE, rotation })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d', { alpha: false })
      
      if (!context) {
        throw new Error('Failed to get canvas context')
      }

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise
      
      const image = canvas.toDataURL('image/jpeg', 0.95)

      // Render thumbnail
      const thumbViewport = page.getViewport({ scale: THUMBNAIL_SCALE, rotation })
      const thumbCanvas = document.createElement('canvas')
      const thumbContext = thumbCanvas.getContext('2d', { alpha: false })
      
      if (!thumbContext) {
        throw new Error('Failed to get thumbnail canvas context')
      }

      thumbCanvas.height = thumbViewport.height
      thumbCanvas.width = thumbViewport.width

      await page.render({
        canvasContext: thumbContext,
        viewport: thumbViewport,
      }).promise
      
      const thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.8)

      const pageData: PageData = {
        image,
        text: text || `Page ${pageNum}`,
        thumbnail,
        pageNumber: pageNum
      }

      // Update cache
      setPageCache(prev => new Map(prev).set(pageNum, pageData))
      pageRenderRef.current.delete(pageNum)
      
      return pageData
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err)
      pageRenderRef.current.delete(pageNum)
      return null
    }
  }, [rotation, pageCache])

  // Smart page pre-rendering
  useEffect(() => {
    if (!pdf || loading) return

    const pagesToRender = new Set<number>()
    
    // Always render current page
    pagesToRender.add(currentPage)
    
    // Pre-render adjacent pages (2 pages before and after)
    for (let i = -2; i <= 2; i++) {
      const pageNum = currentPage + i
      if (pageNum >= 1 && pageNum <= totalPages) {
        pagesToRender.add(pageNum)
      }
    }
    
    // Add pages to render queue
    const queue = Array.from(pagesToRender).filter(p => !pageCache.has(p))
    
    if (queue.length > 0 && !isRendering) {
      setRenderQueue(queue)
    }
  }, [currentPage, pdf, totalPages, loading, pageCache, isRendering])

  // Process render queue
  useEffect(() => {
    if (!pdf || renderQueue.length === 0 || isRendering) return

    const processQueue = async () => {
      setIsRendering(true)
      
      for (const pageNum of renderQueue) {
        if (!pageCache.has(pageNum)) {
          await renderPage(pdf, pageNum)
        }
      }
      
      setRenderQueue([])
      setIsRendering(false)
    }

    processQueue()
  }, [renderQueue, pdf, isRendering, pageCache, renderPage])

  // Handle page selection
  const handlePageSelect = useCallback((pageNum: number) => {
    if (pageNum < 1 || pageNum > totalPages) return
    
    setCurrentPage(pageNum)
    
    const pageData = pageCache.get(pageNum)
    if (pageData && onPageSelect) {
      onPageSelect(pageNum, pageData.text)
    }
  }, [totalPages, pageCache, onPageSelect])

  // Zoom controls
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const currentIndex = ZOOM_LEVELS.indexOf(zoom)
    if (direction === 'in' && currentIndex < ZOOM_LEVELS.length - 1) {
      setZoom(ZOOM_LEVELS[currentIndex + 1])
    } else if (direction === 'out' && currentIndex > 0) {
      setZoom(ZOOM_LEVELS[currentIndex - 1])
    }
  }, [zoom])

  const handleZoomReset = useCallback(() => {
    setZoom(INITIAL_ZOOM)
  }, [])

  // Rotation
  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360)
    // Clear cache on rotation to re-render pages
    setPageCache(new Map())
    pageRenderRef.current.clear()
  }, [])

  // Search functionality
  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const results: number[] = []
    const term = searchTerm.toLowerCase()

    pageCache.forEach((pageData, pageNum) => {
      if (pageData.text.toLowerCase().includes(term)) {
        results.push(pageNum)
      }
    })

    setSearchResults(results)
    
    // Jump to first result
    if (results.length > 0) {
      handlePageSelect(results[0])
    }
  }, [searchTerm, pageCache, handlePageSelect])

  // Download PDF
  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = 'document.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [pdfUrl])

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case 'ArrowLeft':
          if (currentPage > 1) handlePageSelect(currentPage - 1)
          break
        case 'ArrowRight':
          if (currentPage < totalPages) handlePageSelect(currentPage + 1)
          break
        case '+':
        case '=':
          handleZoom('in')
          break
        case '-':
          handleZoom('out')
          break
        case '0':
          handleZoomReset()
          break
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            handleRotate()
          }
          break
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            document.getElementById('pdf-search-input')?.focus()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentPage, totalPages, handlePageSelect, handleZoom, handleZoomReset, handleRotate])

  // Current page data
  const currentPageData = pageCache.get(currentPage)

  if (loading) {
    return (
      <div className={`h-full flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading PDF...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we prepare your document</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`h-full flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Failed to Load PDF</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!pdf || totalPages === 0) {
    return (
      <div className={`h-full flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No PDF loaded</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`flex flex-col h-full bg-gray-900 ${className}`}>
      {/* Main Toolbar */}
      <div className="border-b border-gray-800 bg-gray-950 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoom('out')}
            disabled={zoom === ZOOM_LEVELS[0]}
            className="p-2 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors text-gray-300"
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-3 py-1 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors min-w-[60px]"
            title="Reset zoom (0)"
          >
            {zoom}%
          </button>
          <button
            onClick={() => handleZoom('in')}
            disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="p-2 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors text-gray-300"
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-800 mx-1"></div>
          
          <button
            onClick={handleRotate}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-300"
            title="Rotate (Ctrl+R)"
            aria-label="Rotate page"
          >
            <RotateCw size={18} />
          </button>
        </div>

        {/* Center: Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              id="pdf-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search in document (Ctrl+F)"
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm"
          >
            Search
          </button>
          {searchResults.length > 0 && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-400 hidden sm:block">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="w-px h-6 bg-gray-800 mx-1 hidden sm:block"></div>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-300"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-800 rounded transition-colors text-gray-300"
            title="Download PDF"
            aria-label="Download PDF"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnail Sidebar */}
        {showThumbnails && (
          <div className="w-48 border-r border-gray-800 bg-gray-950 overflow-y-auto p-2">
            <div className="space-y-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                const pageData = pageCache.get(pageNum)
                const isLoaded = pageData?.thumbnail
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageSelect(pageNum)}
                    className={`w-full p-2 rounded border-2 transition-all ${
                      currentPage === pageNum
                        ? 'border-orange-500 bg-gray-800'
                        : 'border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    {isLoaded ? (
                      <img
                        src={pageData.thumbnail}
                        alt={`Page ${pageNum}`}
                        className="w-full h-auto rounded"
                      />
                    ) : (
                      <div className="w-full aspect-[8.5/11] bg-gray-800 rounded flex items-center justify-center">
                        {pageNum === currentPage || Math.abs(pageNum - currentPage) <= 2 ? (
                          <Loader2 className="animate-spin h-6 w-6 text-gray-600" />
                        ) : (
                          <span className="text-xs text-gray-600">{pageNum}</span>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">{pageNum}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* PDF Page Display */}
        <div className="flex-1 overflow-auto bg-gray-950 p-4 flex items-center justify-center">
          {currentPageData ? (
            <div
              className="bg-white shadow-2xl rounded-lg overflow-hidden transition-transform"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
              }}
            >
              <img
                src={currentPageData.image}
                alt={`Page ${currentPage}`}
                className="w-full h-auto block"
                style={{ imageRendering: zoom > 150 ? 'auto' : 'crisp-edges' }}
              />
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-400">Rendering page {currentPage}...</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="border-t border-gray-800 bg-gray-950 px-4 py-3 flex items-center justify-between gap-4">
        <button
          onClick={() => handlePageSelect(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors text-gray-300 flex items-center gap-2"
          title="Previous page (←)"
          aria-label="Previous page"
        >
          <ChevronLeft size={20} />
          <span className="hidden sm:inline text-sm">Previous</span>
        </button>

        {/* Quick Page Navigation with All Thumbnails */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`px-3 py-2 rounded text-sm transition-colors ${
              showThumbnails 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {showThumbnails ? 'Hide' : 'Show'} All Pages
          </button>
          
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value)
              if (page >= 1 && page <= totalPages) {
                handlePageSelect(page)
              }
            }}
            className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-200 text-center focus:outline-none focus:border-orange-500 text-sm"
          />
          
          <span className="text-gray-500 text-sm">/ {totalPages}</span>
        </div>

        <button
          onClick={() => handlePageSelect(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed rounded transition-colors text-gray-300 flex items-center gap-2"
          title="Next page (→)"
          aria-label="Next page"
        >
          <span className="hidden sm:inline text-sm">Next</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
