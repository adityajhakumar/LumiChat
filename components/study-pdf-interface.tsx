"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { FileUp, X, Send, Sparkles, BookOpen, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, GripVertical, FileText, AlertCircle, MessageSquare, Bot, Camera, ExternalLink, Copy, Check, HelpCircle, Award, XCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// Declare global types
declare global {
  interface Window {
    Prism?: any
    __prismLoaded?: boolean
    pdfjsLib?: any
    katex?: any
    __katexLoaded?: boolean
  }
}

export {}

// Quiz Question Interface
interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

// Model configurations
const MODELS = [
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash", provider: "Google" },
  { id: "google/gemma-3n-e2b-it:free", name: "Gemma 3n E2B", provider: "Google" },
  { id: "google/gemma-3-4b-it:free", name: "Gemma 3 4B", provider: "Google" },
  { id: "google/gemma-3-12b-it:free", name: "Gemma 3 12B", provider: "Google" },
  { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B", provider: "Google" },
  { id: "qwen/qwen2.5-vl-32b-instruct:free", name: "Qwen2.5 VL 32B", provider: "Alibaba" },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron Nano VL", provider: "NVIDIA" },
  { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick", provider: "Meta" },
  { id: "meta-llama/llama-4-scout:free", name: "Llama 4 Scout", provider: "Meta" },
]

// CodeBlock Component
function CodeBlock({ code, language = "javascript" }: { code: string; language?: string }) {
  const codeRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)
  const [highlighted, setHighlighted] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadPrism = async () => {
      if (typeof window === "undefined" || !mounted) return

      try {
        if (!window.__prismLoaded) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
          document.head.appendChild(link)

          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script")
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"
            script.crossOrigin = "anonymous"
            script.onload = () => resolve()
            script.onerror = () => reject(new Error("Failed to load Prism"))
            document.head.appendChild(script)
          })

          await new Promise(resolve => setTimeout(resolve, 150))

          const langs = ["python", "javascript", "typescript", "jsx", "tsx", "css", "markup", 
                        "json", "bash", "sql", "java", "cpp", "c", "csharp", "go", "rust", 
                        "ruby", "php"]
          
          for (const lang of langs) {
            if (!mounted) break
            try {
              await new Promise<void>((resolve) => {
                const langScript = document.createElement("script")
                langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`
                langScript.crossOrigin = "anonymous"
                langScript.onload = () => {
                  setTimeout(() => resolve(), 50)
                }
                langScript.onerror = () => resolve()
                document.head.appendChild(langScript)
              })
            } catch {}
          }

          window.__prismLoaded = true
        }

        let attempts = 0
        const maxAttempts = 50
        
        const waitForPrism = (): Promise<void> => {
          return new Promise((resolve) => {
            const check = () => {
              attempts++
              if (window.Prism && 
                  window.Prism.languages && 
                  typeof window.Prism.highlightElement === 'function' &&
                  Object.keys(window.Prism.languages).length > 1) {
                resolve()
              } else if (attempts < maxAttempts && mounted) {
                setTimeout(check, 100)
              } else {
                resolve()
              }
            }
            check()
          })
        }

        await waitForPrism()

        if (window.Prism && 
            window.Prism.languages && 
            codeRef.current && 
            !highlighted && 
            mounted) {
          try {
            const langMap: Record<string, string> = {
              js: "javascript",
              ts: "typescript",
              py: "python",
              rb: "ruby",
              sh: "bash",
              yml: "yaml",
              md: "markdown",
              html: "markup",
              xml: "markup",
            }
            
            const prismLang = langMap[language.toLowerCase()] || language.toLowerCase()
            
            if (window.Prism.languages[prismLang]) {
              window.Prism.highlightElement(codeRef.current)
              setHighlighted(true)
            } else {
              setHighlighted(true)
            }
          } catch {
            setHighlighted(true)
          }
        }
      } catch {
        setHighlighted(true)
      }
    }

    loadPrism()

    return () => {
      mounted = false
    }
  }, [code, language, highlighted])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  const langMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    py: "python",
    rb: "ruby",
    sh: "bash",
    yml: "yaml",
    md: "markdown",
    html: "markup",
    xml: "markup",
  }

  const prismLang = langMap[language.toLowerCase()] || language.toLowerCase()

  return (
    <div className="relative bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#3A3A3A] my-3">
      <div className="flex justify-between items-center bg-[#252525] px-4 py-2 border-b border-[#3A3A3A]">
        <span className="text-xs uppercase text-[#A0A0A0] font-medium">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-[#2A2A2A] hover:bg-[#353535] text-[#A0A0A0] hover:text-[#ECECEC] transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="!m-0 !p-4">
          <code
            ref={codeRef}
            className={`language-${prismLang}`}
            style={{
              fontFamily: '"Fira Code", "Cascadia Code", "SF Mono", Menlo, Consolas, monospace',
              color: highlighted ? undefined : '#E8E8E3',
            }}
          >
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

// Load KaTeX for math rendering
const loadKaTeX = async () => {
  if (typeof window === "undefined") return
  
  if (!window.__katexLoaded) {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
    document.head.appendChild(link)
    
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load KaTeX"))
      document.head.appendChild(script)
    })
    
    window.__katexLoaded = true
  }
}

// Markdown Components with math support
const MarkdownComponents = {
  h1: ({...props}: any) => <h1 className="text-2xl font-semibold mt-6 mb-4 text-[#E8E8E3] leading-tight" {...props} />,
  h2: ({...props}: any) => <h2 className="text-xl font-semibold mt-5 mb-3 text-[#E8E8E3] leading-tight" {...props} />,
  h3: ({...props}: any) => <h3 className="text-lg font-semibold mt-4 mb-2 text-[#E8E8E3] leading-snug" {...props} />,
  p: ({...props}: any) => <p className="mb-3 leading-[1.65] text-[#D4D4CF] text-[15px]" {...props} />,
  ul: ({...props}: any) => <ul className="list-disc list-outside mb-3 space-y-1 text-[#D4D4CF] pl-6 marker:text-[#6B6B65]" {...props} />,
  ol: ({...props}: any) => <ol className="list-decimal list-outside mb-3 space-y-1 text-[#D4D4CF] pl-6 marker:text-[#6B6B65]" {...props} />,
  li: ({...props}: any) => <li className="leading-[1.6] text-[15px] pl-1" {...props} />,
  code: ({inline, className, children, ...props}: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    if (!inline && language) {
      return <CodeBlock code={String(children).replace(/\n$/, '')} language={language} />
    }
    
    return inline 
      ? <code className="bg-[#2A2A2A] px-1.5 py-0.5 rounded text-[#E8E8E3] text-[13.5px] font-mono" {...props}>{children}</code>
      : <CodeBlock code={String(children).replace(/\n$/, '')} language="text" />
  },
  pre: ({children, ...props}: any) => {
    if (children?.type === 'code') {
      return children
    }
    return <pre className="mb-3 overflow-x-auto" {...props}>{children}</pre>
  },
  blockquote: ({...props}: any) => <blockquote className="border-l-3 border-[#AB7C5F] pl-4 my-3 text-[#A8A8A3] leading-[1.65]" {...props} />,
  strong: ({...props}: any) => <strong className="font-semibold text-[#E8E8E3]" {...props} />,
  em: ({...props}: any) => <em className="italic text-[#D4D4CF]" {...props} />,
  a: ({href, children, ...props}: any) => {
    const isExternal = href && !href.startsWith('#') && !href.startsWith('/')
    const finalHref = href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('/') 
      ? `https://${href}` 
      : href
    
    return (
      <a 
        href={finalHref}
        className="text-[#AB7C5F] hover:text-[#C89070] underline decoration-1 underline-offset-2 hover:decoration-2 transition-all inline-flex items-center gap-1" 
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
        {isExternal && <ExternalLink size={12} className="inline-block opacity-60" />}
      </a>
    )
  },
  hr: ({...props}: any) => <hr className="border-[#2E2E2E] my-6" {...props} />,
  table: ({...props}: any) => <div className="overflow-x-auto mb-4"><table className="min-w-full border-collapse" {...props} /></div>,
  th: ({...props}: any) => <th className="border border-[#3A3A3A] px-3 py-2 bg-[#2A2A2A] text-left text-[#E8E8E3] font-semibold" {...props} />,
  td: ({...props}: any) => <td className="border border-[#3A3A3A] px-3 py-2 text-[#D4D4CF]" {...props} />,
}

interface Message {
  role: string;
  content: string;
  isUser: boolean;
  citations?: number[];
  hasImages?: boolean;
}

interface PDFFile {
  name: string;
  url: string;
  totalPages: number;
  pages: Array<{ pageNumber: number; text: string; hasImage?: boolean }>;
  images?: string[];
  isImageHeavy?: boolean;
}

interface PDFChunk {
  text: string;
  pageNumber: number;
  score?: number;
}

// Quiz Generation Modal Component
function QuizGenerationModal({ 
  onClose, 
  onGenerate, 
  totalPages 
}: { 
  onClose: () => void; 
  onGenerate: (config: any) => void; 
  totalPages: number 
}) {
  const [quizType, setQuizType] = useState<'document' | 'topic'>('document')
  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(Math.min(10, totalPages))
  const [topic, setTopic] = useState('')
  const [numQuestions, setNumQuestions] = useState(5)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')

  const handleGenerate = () => {
    if (quizType === 'document') {
      if (startPage > endPage || startPage < 1 || endPage > totalPages) {
        alert('Please enter valid page numbers')
        return
      }
      onGenerate({
        type: 'document',
        startPage,
        endPage,
        numQuestions,
        difficulty
      })
    } else {
      if (!topic.trim()) {
        alert('Please enter a topic')
        return
      }
      onGenerate({
        type: 'topic',
        topic: topic.trim(),
        numQuestions,
        difficulty
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1E1E1E] rounded-xl border border-[#3A3A3A] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2E2E2E]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#AB7C5F] to-[#8B6B52] flex items-center justify-center">
              <HelpCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#E8E8E3]">Generate Quiz</h2>
              <p className="text-sm text-[#6B6B65]">Customize your quiz settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors text-[#9B9B95]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quiz Type Selection */}
          <div>
            <label className="block text-sm font-medium text-[#E8E8E3] mb-3">Quiz Source</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQuizType('document')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  quizType === 'document'
                    ? 'border-[#AB7C5F] bg-[#2A2A2A]'
                    : 'border-[#3A3A3A] bg-[#1E1E1E] hover:border-[#4A4A4A]'
                }`}
              >
                <BookOpen size={24} className={`mx-auto mb-2 ${quizType === 'document' ? 'text-[#AB7C5F]' : 'text-[#6B6B65]'}`} />
                <div className="font-medium text-[#E8E8E3]">From Document</div>
                <div className="text-xs text-[#6B6B65] mt-1">Quiz from specific pages</div>
              </button>
              <button
                onClick={() => setQuizType('topic')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  quizType === 'topic'
                    ? 'border-[#AB7C5F] bg-[#2A2A2A]'
                    : 'border-[#3A3A3A] bg-[#1E1E1E] hover:border-[#4A4A4A]'
                }`}
              >
                <Sparkles size={24} className={`mx-auto mb-2 ${quizType === 'topic' ? 'text-[#AB7C5F]' : 'text-[#6B6B65]'}`} />
                <div className="font-medium text-[#E8E8E3]">Custom Topic</div>
                <div className="text-xs text-[#6B6B65] mt-1">Quiz on any topic</div>
              </button>
            </div>
          </div>

          {/* Document-based Settings */}
          {quizType === 'document' && (
            <div className="space-y-4 p-4 bg-[#0D0D0D] rounded-lg border border-[#2E2E2E]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#E8E8E3] mb-2">Start Page</label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={startPage}
                    onChange={(e) => setStartPage(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E8E8E3] focus:outline-none focus:border-[#AB7C5F]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#E8E8E3] mb-2">End Page</label>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={endPage}
                    onChange={(e) => setEndPage(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E8E8E3] focus:outline-none focus:border-[#AB7C5F]"
                  />
                </div>
              </div>
              <p className="text-xs text-[#6B6B65]">
                Quiz will be generated from pages {startPage} to {endPage} (Total: {Math.max(0, endPage - startPage + 1)} pages)
              </p>
            </div>
          )}

          {/* Topic-based Settings */}
          {quizType === 'topic' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#E8E8E3]">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quantum Mechanics, Machine Learning, etc."
                className="w-full px-4 py-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#E8E8E3] placeholder-[#6B6B65] focus:outline-none focus:border-[#AB7C5F]"
              />
              <p className="text-xs text-[#6B6B65]">Enter a detailed topic for in-depth questions</p>
            </div>
          )}

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-medium text-[#E8E8E3] mb-3">
              Number of Questions: <span className="text-[#AB7C5F]">{numQuestions}</span>
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              className="w-full h-2 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#AB7C5F]"
            />
            <div className="flex justify-between text-xs text-[#6B6B65] mt-1">
              <span>3</span>
              <span>15</span>
            </div>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-medium text-[#E8E8E3] mb-3">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                    difficulty === level
                      ? 'border-[#AB7C5F] bg-[#2A2A2A] text-[#E8E8E3]'
                      : 'border-[#3A3A3A] bg-[#1E1E1E] text-[#6B6B65] hover:border-[#4A4A4A]'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2E2E2E]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-[#2A2A2A] hover:bg-[#353535] text-[#E8E8E3] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#AB7C5F] to-[#8B6B52] hover:from-[#8B6B52] hover:to-[#7B5B42] text-white font-medium transition-all"
          >
            Generate Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

// Quiz Mode Component
function QuizMode({ 
  questions, 
  onComplete, 
  topic 
}: { 
  questions: QuizQuestion[]; 
  onComplete: () => void; 
  topic?: string 
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)

  const question = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1
  const hasAnswered = selectedAnswers[currentQuestion] !== undefined

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: optionIndex,
    })
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true)
    } else {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const calculateScore = () => {
    let correct = 0
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correct++
      }
    })
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    }
  }

  // Results screen
  if (showResults) {
    const score = calculateScore()
    const passed = score.percentage >= 70

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#1E1E1E]">
        <div className="flex items-center justify-between p-6 border-b border-[#2E2E2E] flex-shrink-0">
          <h2 className="text-xl font-bold text-[#E5E5E0]">Quiz Results</h2>
          <button
            onClick={onComplete}
            className="p-2 hover:bg-[#2E2E2E] rounded-lg transition-colors text-[#9B9B95]"
            title="Exit quiz"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Score Card */}
            <div
              className={`p-8 rounded-xl border-2 ${
                passed
                  ? "bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-600"
                  : "bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-600"
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                {passed ? (
                  <Award size={64} className="text-green-400" />
                ) : (
                  <div className="text-6xl">📚</div>
                )}
              </div>
              <h3 className="text-3xl font-bold text-center mb-2 text-[#E8E8E3]">
                {passed ? "Congratulations!" : "Keep Learning!"}
              </h3>
              <p className="text-center text-[#9B9B95] mb-6">
                {passed
                  ? "You've demonstrated great understanding of the topic!"
                  : "Review the explanations below and try again."}
              </p>
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-[#AB7C5F]">{score.percentage}%</div>
                  <div className="text-sm text-[#6B6B65] mt-1">Score</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[#E5E5E0]">
                    {score.correct}/{score.total}
                  </div>
                  <div className="text-sm text-[#6B6B65] mt-1">Correct</div>
                </div>
              </div>
            </div>

            {/* Question Review */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#E5E5E0] mb-4">Review Your Answers</h4>
              {questions.map((q, index) => {
                const userAnswer = selectedAnswers[index]
                const isCorrect = userAnswer === q.correct

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-lg border ${
                      isCorrect ? "border-green-600 bg-green-900/10" : "border-red-600 bg-red-900/10"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          isCorrect ? "bg-green-600" : "bg-red-600"
                        }`}
                      >
                        {isCorrect ? <Check size={16} /> : <X size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#E5E5E0] mb-2">
                          {index + 1}. {q.question}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-[#6B6B65]">Your answer: </span>
                            <span className={isCorrect ? "text-green-400" : "text-red-400"}>
                              {q.options[userAnswer]}
                            </span>
                          </div>
                          {!isCorrect && (
                            <div>
                              <span className="text-[#6B6B65]">Correct answer: </span>
                              <span className="text-green-400">{q.options[q.correct]}</span>
                            </div>
                          )}
                          <div className="mt-2 p-3 bg-[#0D0D0D] rounded text-[#9B9B95] border border-[#2E2E2E]">
                            <span className="font-medium text-[#AB7C5F]">Explanation: </span>
                            {q.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={onComplete}
              className="w-full px-6 py-3 bg-[#AB7C5F] hover:bg-[#8B6B52] rounded-lg text-white font-medium transition-colors"
            >
              Return to Document
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz view
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#1E1E1E]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#2E2E2E] flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-[#6B6B65] mb-1">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            {topic && (
              <>
                <span>•</span>
                <span>Topic: {topic}</span>
              </>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#E5E5E0]">Quiz Time</h2>
        </div>
        <button
          onClick={onComplete}
          className="p-2 hover:bg-[#2E2E2E] rounded-lg transition-colors text-[#9B9B95]"
          title="Exit quiz"
        >
          <XCircle size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-[#0D0D0D] flex-shrink-0">
        <div 
          className="h-full bg-gradient-to-r from-[#AB7C5F] to-[#8B6B52] transition-all duration-300"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0D0D0D] rounded-lg p-6 border border-[#2E2E2E] mb-6">
            <h3 className="text-lg font-semibold text-[#E5E5E0] mb-6">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion] === index
                const isCorrect = index === question.correct
                const showCorrect = hasAnswered && isCorrect
                const showIncorrect = hasAnswered && isSelected && !isCorrect

                return (
                  <button
                    key={index}
                    onClick={() => !hasAnswered && handleSelectAnswer(index)}
                    disabled={hasAnswered}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      showCorrect
                        ? "border-green-600 bg-green-900/20"
                        : showIncorrect
                        ? "border-red-600 bg-red-900/20"
                        : isSelected
                        ? "border-[#AB7C5F] bg-[#2E2E2E]"
                        : "border-[#2E2E2E] bg-[#1E1E1E] hover:border-[#3E3E3E]"
                    } ${hasAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        showCorrect
                          ? "border-green-600 bg-green-600"
                          : showIncorrect
                          ? "border-red-600 bg-red-600"
                          : isSelected
                          ? "border-[#AB7C5F] bg-[#AB7C5F]"
                          : "border-[#4E4E4E]"
                      }`}>
                        {showCorrect && <Check size={14} className="text-white" />}
                        {showIncorrect && <X size={14} className="text-white" />}
                        {isSelected && !hasAnswered && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-[#E5E5E0] font-medium flex-1">{option}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            {hasAnswered && (
              <div className="mt-6 p-4 rounded-lg bg-[#2E2E2E] border border-[#3E3E3E]">
                <p className="text-sm text-[#9B9B95]">
                  <span className="font-medium text-[#E5E5E0]">Explanation:</span>{" "}
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-[#2E2E2E] bg-[#171717] px-6 py-4 flex items-center justify-between flex-shrink-0">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="px-4 py-2 rounded-lg bg-[#2E2E2E] text-[#E5E5E0] hover:bg-[#3E3E3E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Previous
        </button>
        <div className="text-sm text-[#6B6B65]">
          {Object.keys(selectedAnswers).length} / {questions.length} answered
        </div>
        <button
          onClick={handleNext}
          disabled={!hasAnswered}
          className="px-6 py-2 rounded-lg bg-[#AB7C5F] text-white hover:bg-[#8B6B52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          {isLastQuestion ? "Submit Quiz" : "Next"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

// Model Selector Component
function ModelSelector({ selectedModel, onModelChange, disabled }: { selectedModel: string; onModelChange: (model: string) => void; disabled?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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
        className="px-3 py-2 rounded-lg bg-[#2A2A2A] hover:bg-[#353535] border border-[#3A3A3A] 
                   transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-[#E8E8E3] text-xs font-medium truncate max-w-[140px]">
          {currentModel?.name || "Select Model"}
        </span>
        <ChevronRight size={14} className={`text-[#9B9B95] transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg shadow-2xl z-50 
                        min-w-[240px] max-h-[400px] overflow-y-auto">
          <div className="sticky top-0 bg-[#1E1E1E] px-3 py-2 border-b border-[#3A3A3A]">
            <span className="text-[10px] uppercase font-semibold text-[#6B6B65]">Multimodal Models</span>
          </div>
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onModelChange(model.id)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2.5 transition-colors flex flex-col gap-0.5 ${
                selectedModel === model.id
                  ? "bg-[#353535] text-white"
                  : "hover:bg-[#323232] text-[#E8E8E3]"
              }`}
            >
              <div className="font-medium text-sm">{model.name}</div>
              <div className="text-[10px] text-[#6B6B65]">{model.provider}</div>
            </button>
          ))}
          <div className="px-3 py-2 border-t border-[#3A3A3A] bg-[#1E1E1E]">
            <p className="text-[10px] text-[#6B6B65] leading-relaxed">
              💡 If one model is rate-limited, the system will automatically try others
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// PDF Viewer Component
function PDFViewer({ pdfUrl, currentPage, setCurrentPage, zoom, setZoom, rotation, setRotation }: {
  pdfUrl: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  zoom: number;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  rotation: number;
  setRotation: (rotation: number | ((prev: number) => number)) => void;
}) {
  const [pages, setPages] = useState<Array<{ image: string; pageNumber: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const loadPdf = async () => {
      try {
        setError(null)
        setLoading(true)
        
        if (!window.pdfjsLib) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
            script.onload = () => resolve()
            script.onerror = () => reject(new Error('Failed to load PDF.js'))
            document.head.appendChild(script)
          })
        }
        
        const pdfjsLib = window.pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise
        setTotalPages(pdf.numPages)

        const loadedPages: Array<{ image: string; pageNumber: number }> = []
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
        const errorMessage = error instanceof Error ? error.message : 'Failed to load PDF'
        console.error('Error loading PDF:', error)
        setError(errorMessage)
        setLoading(false)
      }
    }

    if (pdfUrl) loadPdf()
  }, [pdfUrl])

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in' && zoom < 200) {
      setZoom(zoom + 25)
    } else if (direction === 'out' && zoom > 50) {
      setZoom(zoom - 25)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0F0F0F]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#AB7C5F] mx-auto mb-3" />
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
              src={currentPageData.image || "/placeholder.svg"} 
              alt={`Page ${currentPage}`} 
              className="w-full h-auto"
              draggable={false}
            />
          </div>
        )}
      </div>

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
            className="w-14 px-2 py-1 bg-[#2A2A2A] border border-[#3A3A3A] text-[#E8E8E3] rounded text-xs text-center focus:outline-none focus:border-[#AB7C5F]"
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
function Message({ message, onRetry }: { message: Message; onRetry?: () => void }) {
  useEffect(() => {
    loadKaTeX()
  }, [])

  if (message.isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fadeIn">
        <div className="max-w-[80%] bg-[#2A2A2A] text-[#E8E8E3] rounded-2xl px-4 py-3 border border-[#3A3A3A]">
          <div className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</div>
        </div>
      </div>
    )
  }

  const isError = message.content.includes('**Error:**') || message.content.includes('**⚠️')

  return (
    <div className="flex justify-start mb-6 animate-fadeIn">
      <div className="max-w-[85%]">
        <div className="flex items-start gap-3">
          <div className={`w-7 h-7 rounded-full ${isError ? 'bg-red-500/20 border-2 border-red-500/50' : 'bg-gradient-to-br from-[#AB7C5F] to-[#8B6B52]'} flex items-center justify-center flex-shrink-0 mt-1`}>
            {isError ? <AlertCircle size={16} className="text-red-400" /> : <Bot size={16} className="text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={MarkdownComponents}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            {message.citations && message.citations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#2E2E2E] flex items-center gap-2 flex-wrap">
                <BookOpen size={12} className="text-[#AB7C5F]" />
                <span className="text-xs text-[#6B6B65]">Referenced pages:</span>
                {message.citations.map((cite: number, i: number) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-[#2A2A2A] rounded text-[#AB7C5F] border border-[#3A3A3A]">
                    {cite}
                  </span>
                ))}
                {message.hasImages && (
                  <span className="text-xs px-2 py-0.5 bg-blue-500/20 rounded text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Camera size={10} />
                    Visual analysis
                  </span>
                )}
              </div>
            )}
            {isError && onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 px-3 py-1.5 bg-[#AB7C5F] hover:bg-[#8B6B52] text-white text-xs rounded-md transition-colors flex items-center gap-1.5"
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
  const [pdfFile, setPdfFile] = useState<PDFFile | null>(null)
  const [pdfChunks, setPdfChunks] = useState<PDFChunk[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [processingPDF, setProcessingPDF] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [splitPosition, setSplitPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [lastQuery, setLastQuery] = useState<string | null>(null)
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [generatingQuiz, setGeneratingQuiz] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const splitContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
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

  const chunkPDFContent = (pdfPages: Array<{ pageNumber: number; text: string; hasImage?: boolean }>) => {
    const chunks: PDFChunk[] = []
    const CHUNK_SIZE = 1000
    const OVERLAP = 200

    pdfPages.forEach((pageData, pageIndex) => {
      const pageNum = pageIndex + 1
      const text = pageData.text
      
      if (pageData.hasImage || text.includes('[Page') && text.includes('Image-based content]')) {
        chunks.push({
          text: `Page ${pageNum} contains visual/image content that requires visual analysis.`,
          pageNumber: pageNum,
        })
        return
      }
      
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

  const findRelevantChunks = (query: string, chunks: PDFChunk[], topK = 5) => {
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
      .filter(c => c.score && c.score > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, topK)
  }

  const callAPI = async (userPrompt: string, images?: string[], retryCount = 0, triedModels: string[] = []): Promise<string> => {
    const currentModelToTry = retryCount === 0 ? selectedModel : MODELS.find(m => !triedModels.includes(m.id))?.id || selectedModel
    
    try {
      let messageContent: any = userPrompt
      
      if (images && images.length > 0) {
        const contentArray: Array<{type: string; text?: string; image_url?: {url: string}}> = [
          { type: "text", text: userPrompt }
        ]
        
        images.slice(0, 4).forEach(imageData => {
          contentArray.push({
            type: "image_url",
            image_url: { url: imageData }
          })
        })
        
        messageContent = contentArray
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: "user", content: messageContent }],
          model: currentModelToTry,
          stream: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 429 || response.status === 500 || errorData.error?.code === 429) {
          const updatedTriedModels = [...triedModels, currentModelToTry]
          
          if (updatedTriedModels.length < MODELS.length) {
            const nextModel = MODELS.find(m => !updatedTriedModels.includes(m.id))
            
            if (nextModel) {
              await new Promise(resolve => setTimeout(resolve, 1000))
              setSelectedModel(nextModel.id)
              return await callAPI(userPrompt, images, retryCount + 1, updatedTriedModels)
            }
          }
          
          throw new Error(`All ${MODELS.length} models are currently rate-limited. Please try again in a few moments.`)
        }
        
        if (response.status === 403 || errorData.error?.code === 403) {
          throw new Error('Content moderation flagged this request. Please try a different model or rephrase your question.')
        }
        
        throw new Error(errorData.error?.message || `API Error: ${response.status}`)
      }

      const data = await response.json()
      let content = data.content || data.choices?.[0]?.message?.content || data.text || data.message?.content
      
      if (!content) {
        throw new Error('No content in API response. Response format may have changed.')
      }
      
      return content
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error('API call failed:', errorMsg, error)
      throw error
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load PDF.js'))
          document.head.appendChild(script)
        })
      }
      
      const pdfjsLib = window.pdfjsLib
      pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const pdfPages: Array<{ pageNumber: number; text: string; hasImage: boolean }> = []
      const pdfImages: string[] = []
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        
        const textContent = await page.getTextContent()
        const text = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .trim()
          .replace(/\s+/g, ' ')
        
        const hasText = text.replace(/\s/g, '').length > 50
        
        let hasImage = false
        if (!hasText || text.length < 100) {
          try {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            const viewport = page.getViewport({ scale: 1.5 })
            
            if (context) {
              canvas.height = viewport.height
              canvas.width = viewport.width
              await page.render({ canvasContext: context, viewport }).promise
              const imageData = canvas.toDataURL('image/jpeg', 0.85)
              pdfImages.push(imageData)
              hasImage = true
            }
          } catch (imgErr) {
            console.warn(`Failed to extract image from page ${i}:`, imgErr)
          }
        }
        
        pdfPages.push({ 
          pageNumber: i, 
          text: text || `[Page ${i} - Image-based content]`,
          hasImage 
        })
      }
      
      const chunks = chunkPDFContent(pdfPages)
      const imagePages = pdfPages.filter(p => p.hasImage).length
      const isImageHeavy = imagePages > pdf.numPages * 0.3
      
      setPdfFile({ 
        name: file.name, 
        url, 
        totalPages: pdf.numPages, 
        pages: pdfPages,
        images: pdfImages,
        isImageHeavy
      })
      setPdfChunks(chunks)
      setMessages([
        {
          role: 'assistant',
          content: isImageHeavy 
            ? `📄 **PDF Loaded: ${file.name}**\n\n✅ **${pdf.numPages} pages processed**\n⚠️ **Note:** This PDF contains ${imagePages} image-based pages. I've extracted images for better analysis.\n\n**What would you like to know about this document?**`
            : `📄 **PDF Loaded: ${file.name}**\n\n✅ **${pdf.numPages} pages with ${chunks.length} text chunks**\n\n**What would you like to know about this document?**`,
          isUser: false
        }
      ])
      setInput('')
      setCurrentPage(1)
      setProcessingPDF(false)
    } catch (err) {
      console.error('Error processing PDF:', err)
      setProcessingPDF(false)
      alert(`Failed to process PDF: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleGenerateQuiz = async (config: any) => {
    setShowQuizModal(false)
    setGeneratingQuiz(true)
    
    try {
      let prompt = ''
      
      if (config.type === 'document') {
        const relevantPages = pdfFile!.pages.filter(
          p => p.pageNumber >= config.startPage && p.pageNumber <= config.endPage
        )
        
        const context = relevantPages.map(p => 
          `[Page ${p.pageNumber}]\n${p.text}`
        ).join('\n\n')
        
        prompt = `You are a quiz generator. Generate a ${config.difficulty} difficulty quiz with EXACTLY ${config.numQuestions} multiple-choice questions based on the following document content:

${context}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON, no markdown formatting, no backticks
2. Each question must have exactly 4 options
3. The "correct" field must be the index (0-3) of the correct answer
4. Include detailed explanations for each answer

Return in this EXACT format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation here"
    }
  ]
}

Generate ${config.numQuestions} questions now:`
      } else {
        prompt = `You are a quiz generator. Generate a ${config.difficulty} difficulty quiz with EXACTLY ${config.numQuestions} multiple-choice questions about the topic: "${config.topic}"

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON, no markdown formatting, no backticks
2. Each question must have exactly 4 options
3. The "correct" field must be the index (0-3) of the correct answer
4. Include detailed explanations for each answer
5. Make questions in-depth and comprehensive about ${config.topic}

Return in this EXACT format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Detailed explanation here"
    }
  ]
}

Generate ${config.numQuestions} questions now:`
      }
      
      const response = await callAPI(prompt)
      
      let cleanedResponse = response.trim()
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '')
      cleanedResponse = cleanedResponse.replace(/^[^{]*({[\s\S]*})[^}]*$/, '$1')
      
      const quizData = JSON.parse(cleanedResponse)
      
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz format')
      }
      
      setQuizQuestions(quizData.questions)
      setQuizMode(true)
      setGeneratingQuiz(false)
    } catch (error) {
      console.error('Quiz generation error:', error)
      setGeneratingQuiz(false)
      alert('Failed to generate quiz. Please try again.')
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !pdfFile || loading) return

    const userQuestion = input.trim()
    const userMessage: Message = { role: 'user', content: userQuestion, isUser: true }
    
    setLastQuery(userQuestion)
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    if (pdfFile.isImageHeavy) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '🔍 Analyzing document with visual content...',
        isUser: false
      }])
    }

    let imagePagesToSend: string[] = []

    try {
      const pageMatch = userQuestion.match(/page\s+(\d+)/i)
      let relevantChunks: PDFChunk[] = []
      
      if (pageMatch) {
        const requestedPage = parseInt(pageMatch[1])
        relevantChunks = pdfChunks.filter(chunk => chunk.pageNumber === requestedPage)
        
        if (relevantChunks.length === 0) {
          relevantChunks = pdfChunks.filter(chunk => 
            Math.abs(chunk.pageNumber - requestedPage) <= 1
          )
        }
      } else {
        relevantChunks = findRelevantChunks(userQuestion, pdfChunks, 5)
        
        const currentPageChunks = pdfChunks.filter(chunk => chunk.pageNumber === currentPage)
        currentPageChunks.forEach(chunk => {
          if (!relevantChunks.find(c => c.pageNumber === chunk.pageNumber && c.text === chunk.text)) {
            relevantChunks.push(chunk)
          }
        })
      }
      
      if (relevantChunks.length === 0) {
        relevantChunks = pdfChunks.filter(chunk => 
          Math.abs(chunk.pageNumber - currentPage) <= 1
        ).slice(0, 5)
      }
      
      const context = relevantChunks.map(chunk => 
        `[Page ${chunk.pageNumber}]\n${chunk.text}`
      ).join('\n\n---\n\n')

      const citations = [...new Set(relevantChunks.map(c => c.pageNumber))].sort((a, b) => a - b)

      imagePagesToSend = []
      if (pdfFile.images && pdfFile.images.length > 0) {
        const currentPageData = pdfFile.pages.find(p => p.pageNumber === currentPage)
        if (currentPageData?.hasImage) {
          const imageIndex = pdfFile.pages
            .filter(p => p.hasImage)
            .findIndex(p => p.pageNumber === currentPage)
          if (imageIndex >= 0 && imageIndex < pdfFile.images.length) {
            imagePagesToSend.push(pdfFile.images[imageIndex])
          }
        }
        
        if (pdfFile.isImageHeavy) {
          citations.forEach(pageNum => {
            if (pageNum === currentPage) return
            const page = pdfFile.pages.find(p => p.pageNumber === pageNum)
            if (page?.hasImage && pdfFile.images) {
              const imageIndex = pdfFile.pages
                .filter(p => p.hasImage)
                .findIndex(p => p.pageNumber === pageNum)
              if (imageIndex >= 0 && imageIndex < pdfFile.images.length && imagePagesToSend.length < 4) {
                imagePagesToSend.push(pdfFile.images[imageIndex])
              }
            }
          })
        }
      }

      let prompt = `You are a helpful PDF study assistant analyzing "${pdfFile.name}".

The user is currently viewing PAGE ${currentPage} of the document.

Here is the relevant content from the document:

${context}

User Question: ${userQuestion}

Instructions:
- Answer based on BOTH the text context above AND the images provided (if any)
- Pay special attention to content from page ${currentPage} since that's what the user is currently viewing
- **CRITICAL: When displaying code, ALWAYS wrap it in markdown code blocks with the language specified**
  Example: \`\`\`cpp\n// code here\n\`\`\`
  Example: \`\`\`python\n# code here\n\`\`\`
- **CRITICAL: For mathematical expressions, use LaTeX notation:**
  - Inline math: $expression$
  - Display math: $expression$
  Example: $E = mc^2$ or $\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$
- Use proper markdown formatting with headers, bold, lists, code blocks
- Be specific and reference page numbers when appropriate
- If images are provided, analyze their visual content in detail
- If the question asks about "this page", refer to page ${currentPage}

Provide your answer:`

      const content = await callAPI(prompt, imagePagesToSend.length > 0 ? imagePagesToSend : undefined)

      let formattedContent = content
      
      if (!formattedContent.includes('```')) {
        const codePatterns = [
          /\b(digitalWrite|pinMode|delay|Serial\.|if|while|for)\s*\(/gi,
          /\b(int|void|float|char|const)\s+\w+\s*[=;(]/gi,
        ]
        
        const hasCode = codePatterns.some(pattern => pattern.test(formattedContent))
        
        if (hasCode) {
          const lines = formattedContent.split('\n')
          let inCodeBlock = false
          let codeLines: string[] = []
          const newLines: string[] = []
          
          lines.forEach((line, index) => {
            const isCodeLine = /^\s*(digitalWrite|pinMode|delay|if|while|for|int|void|return|Serial|\/\/)/i.test(line) ||
                              /[{};]$/.test(line.trim()) ||
                              (inCodeBlock && line.trim().length > 0 && !line.match(/^[#*-]/))
            
            if (isCodeLine && !inCodeBlock) {
              inCodeBlock = true
              codeLines = [line]
            } else if (isCodeLine && inCodeBlock) {
              codeLines.push(line)
            } else if (!isCodeLine && inCodeBlock) {
              newLines.push('```cpp')
              newLines.push(...codeLines)
              newLines.push('```')
              newLines.push(line)
              inCodeBlock = false
              codeLines = []
            } else {
              newLines.push(line)
            }
            
            if (index === lines.length - 1 && inCodeBlock) {
              newLines.push('```cpp')
              newLines.push(...codeLines)
              newLines.push('```')
            }
          })
          
          if (newLines.length > 0) {
            formattedContent = newLines.join('\n')
          }
        }
      }

      setMessages(prev => {
        const filtered = prev.filter(m => !m.content.includes('🔍 Analyzing document'))
        return [...filtered, {
          role: 'assistant',
          content: formattedContent,
          isUser: false,
          citations: citations.length > 0 ? citations : undefined,
          hasImages: imagePagesToSend.length > 0
        }]
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred'
      
      let displayMessage = `**⚠️ Error**\n\n${errorMessage}`
      
      if (errorMessage.includes('rate-limited')) {
        displayMessage = `**⚠️ Rate Limit Reached**\n\n${errorMessage}\n\n**Try:** Wait a moment or manually switch models.`
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleRetry = () => {
    if (lastQuery && !loading) {
      setInput(lastQuery)
      setTimeout(() => handleSendMessage(), 100)
    }
  }

  if (processingPDF) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1A1A]">
        <div className="text-center">
          <Loader2 className="w-14 h-14 animate-spin text-[#AB7C5F] mx-auto mb-4" />
          <p className="text-[#E8E8E3] text-lg font-medium">Processing PDF...</p>
          <p className="text-[#6B6B65] text-sm mt-2">Extracting text and preparing document</p>
        </div>
      </div>
    )
  }

  if (!pdfFile) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1A1A]">
        <div className="text-center px-4 max-w-md">
          <div className="w-20 h-20 rounded-full bg-[#2A2A2A] border-2 border-[#3A3A3A] flex items-center justify-center mx-auto mb-6">
            <FileUp size={40} className="text-[#AB7C5F]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#E8E8E3] mb-2">Upload PDF Document</h2>
          <p className="text-[#9B9B95] mb-6">Upload any PDF and chat with it using AI</p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-gradient-to-r from-[#AB7C5F] to-[#8B6B52] hover:from-[#8B6B52] hover:to-[#7B5B42] text-white rounded-lg font-medium transition-all transform hover:scale-105"
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

  if (generatingQuiz) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1A1A1A]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#AB7C5F] to-[#8B6B52] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <HelpCircle size={32} className="text-white" />
          </div>
          <p className="text-[#E8E8E3] text-lg font-medium">Generating Quiz...</p>
          <p className="text-[#6B6B65] text-sm mt-2">Creating questions based on your settings</p>
        </div>
      </div>
    )
  }

  if (quizMode) {
    return (
      <QuizMode 
        questions={quizQuestions} 
        onComplete={() => {
          setQuizMode(false)
          setQuizQuestions([])
        }} 
        topic={pdfFile.name}
      />
    )
  }

  return (
    <div 
      ref={splitContainerRef}
      className="flex h-screen bg-[#1A1A1A] overflow-hidden select-none"
      style={{ cursor: isDragging ? 'col-resize' : 'default' }}
    >
      {showQuizModal && (
        <QuizGenerationModal
          onClose={() => setShowQuizModal(false)}
          onGenerate={handleGenerateQuiz}
          totalPages={pdfFile.totalPages}
        />
      )}

      {/* Left Panel - Chat */}
      <div 
        className="flex flex-col bg-[#1A1A1A] overflow-hidden"
        style={{ width: `${splitPosition}%` }}
      >
        {/* Header */}
        <div className="border-b border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText size={18} className="text-[#AB7C5F]" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-[#E8E8E3] truncate max-w-[200px]">{pdfFile.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6B65]">{pdfFile.totalPages} pages • {pdfChunks.length} chunks</span>
                {pdfFile.isImageHeavy && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    IMAGE-HEAVY
                  </span>
                )}
              </div>
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
            onClick={() => setShowQuizModal(true)}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-gradient-to-r from-[#AB7C5F] to-[#8B6B52] hover:from-[#8B6B52] hover:to-[#7B5B42] text-white text-xs whitespace-nowrap transition-all disabled:opacity-50 flex items-center gap-1.5 font-medium"
          >
            <HelpCircle size={14} />
            Quiz Me
          </button>
          <button
            onClick={() => {
              setInput("Summarize this entire document")
              setTimeout(() => handleSendMessage(), 100)
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-[#2A2A2A] hover:bg-[#353535] text-[#E8E8E3] text-xs whitespace-nowrap transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-[#3A3A3A]"
          >
            <Sparkles size={14} className="text-[#AB7C5F]" />
            Summarize
          </button>
          <button
            onClick={() => {
              setInput(`Explain page ${currentPage} in detail`)
              setTimeout(() => handleSendMessage(), 100)
            }}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-[#2A2A2A] hover:bg-[#353535] text-[#E8E8E3] text-xs whitespace-nowrap transition-colors disabled:opacity-50 flex items-center gap-1.5 border border-[#3A3A3A]"
          >
            <BookOpen size={14} className="text-[#AB7C5F]" />
            Explain Page {currentPage}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <MessageSquare className="w-12 h-12 text-[#AB7C5F] mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-[#E8E8E3] mb-2">Start a Conversation</h3>
                <p className="text-sm text-[#9B9B95] mb-4">Ask questions about your PDF document</p>
                <div className="grid gap-2">
                  {["What is this document about?", "Summarize the key points", "Explain page " + currentPage].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="p-3 bg-[#2A2A2A] hover:bg-[#353535] rounded-lg text-sm text-[#E8E8E3] text-left border border-[#3A3A3A] transition-colors"
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
                <Message key={i} message={msg} onRetry={msg.content?.includes('**Error:**') || msg.content?.includes('**⚠️') ? handleRetry : undefined} />
              ))}
              {loading && (
                <div className="flex justify-start mb-6 animate-fadeIn">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#AB7C5F] to-[#8B6B52] flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-[#2A2A2A] rounded-2xl px-4 py-3 border border-[#3A3A3A]">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-[#AB7C5F] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#AB7C5F] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#AB7C5F] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              className="resize-none bg-[#2A2A2A] border border-[#3A3A3A] text-[#E8E8E3] placeholder-[#6B6B6B] focus:border-[#AB7C5F] focus:outline-none rounded-lg text-[15px] flex-1 px-3 py-2 max-h-[120px] disabled:opacity-50"
              rows={1}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-[#AB7C5F] hover:bg-[#8B6B52] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center self-end"
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
        className="w-1 bg-[#2E2E2E] hover:bg-[#AB7C5F] cursor-col-resize flex items-center justify-center group transition-colors relative"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
        <GripVertical size={16} className="text-[#6B6B65] group-hover:text-[#AB7C5F] transition-colors" />
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
