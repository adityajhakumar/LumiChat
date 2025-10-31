"use client"

import { useState, useEffect } from "react"
import { Copy, Play, Check, Send, BookOpen } from "lucide-react"

interface CodeEditorProps {
  language: string
  onLanguageChange: (lang: string) => void
  onCodeFeedback?: (code: string) => void
  onStartQuiz?: (numQuestions: number) => void
}

export default function CodeEditor({ language, onLanguageChange, onCodeFeedback, onStartQuiz }: CodeEditorProps) {
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pyodideReady, setPyodideReady] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackCode, setFeedbackCode] = useState("")
  const [showQuizMode, setShowQuizMode] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<number>(5)

  const languages = ["python", "javascript", "cpp", "java", "c"]

  useEffect(() => {
    const initPyodide = async () => {
      try {
        const pyodide = await (window as any).loadPyodide?.()
        if (pyodide) {
          setPyodideReady(true)
        }
      } catch (err) {
        console.log("Pyodide not available, code execution disabled")
      }
    }
    initPyodide()
  }, [])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first")
      return
    }

    setIsRunning(true)
    setOutput("")

    try {
      if (language === "python" && pyodideReady) {
        try {
          const pyodide = (window as any).pyodide
          if (pyodide) {
            // Capture stdout
            const oldLog = console.log
            const logs: string[] = []
            console.log = (...args: any[]) => {
              logs.push(args.join(" "))
              oldLog(...args)
            }

            try {
              await pyodide.runPythonAsync(code)
              setOutput(logs.join("\n") || "Code executed successfully")
            } catch (err: any) {
              setOutput(`Error: ${err.message}`)
            } finally {
              console.log = oldLog
            }
          } else {
            setOutput("Python runtime not ready. Try again in a moment.")
          }
        } catch (err: any) {
          setOutput(`Execution error: ${err.message}`)
        }
      } else if (language === "javascript") {
        try {
          const logs: string[] = []
          const oldLog = console.log
          console.log = (...args: any[]) => {
            logs.push(args.join(" "))
            oldLog(...args)
          }

          // eslint-disable-next-line no-eval
          eval(code)
          setOutput(logs.join("\n") || "Code executed successfully")
          console.log = oldLog
        } catch (err: any) {
          setOutput(`Error: ${err.message}`)
        }
      } else {
        setOutput(`Code execution for ${language} requires a backend service. Use the chat to run this code.`)
      }
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0D1117] border-l border-[#2E2E2E]">
      {/* Header */}
      <div className="border-b border-[#2E2E2E] bg-[#171717] px-4 py-3 flex items-center justify-between flex-shrink-0">
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-[#2E2E2E] text-white px-3 py-1.5 rounded text-sm border border-[#3E3E3E] focus:outline-none focus:ring-2 focus:ring-[#CC785C]"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            onClick={handleCopyCode}
            className="p-2 hover:bg-[#232323] rounded transition-colors text-[#9B9B95]"
            title="Copy code"
          >
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={handleRunCode}
            disabled={isRunning || !code.trim()}
            className="p-2 hover:bg-[#CC785C] hover:text-white rounded transition-colors text-[#9B9B95] disabled:opacity-50"
            title="Run code"
          >
            <Play size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your code here..."
          className="flex-1 bg-[#0D1117] text-[#E5E5E0] p-4 font-mono text-sm resize-none border-none focus:outline-none focus:ring-0"
        />
      </div>

      <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-3 flex gap-2 flex-shrink-0">
        <button
          onClick={() => setShowFeedbackForm(!showFeedbackForm)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#2E2E2E] hover:bg-[#3E3E3E] text-[#E5E5E0] transition-colors text-sm font-medium"
          title="Get AI feedback on your code"
        >
          <Send size={14} />
          Send for Feedback
        </button>
        <button
          onClick={() => setShowQuizMode(!showQuizMode)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#2E2E2E] hover:bg-[#3E3E3E] text-[#E5E5E0] transition-colors text-sm font-medium"
          title="Take a quiz on this topic"
        >
          <BookOpen size={14} />
          Quiz Mode
        </button>
      </div>

      {showFeedbackForm && (
        <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-3 flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (code.trim()) {
                  onCodeFeedback?.(code)
                  setShowFeedbackForm(false)
                }
              }}
              disabled={!code.trim()}
              className="flex-1 px-3 py-2 rounded-lg bg-[#CC785C] hover:bg-[#B8674A] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Get Feedback on Current Code
            </button>
          </div>
        </div>
      )}

      {showQuizMode && (
        <div className="border-t border-[#2E2E2E] bg-[#171717] px-4 py-3 flex-shrink-0">
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#6B6B65] uppercase">Select number of questions:</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setQuizQuestions(num)
                    onStartQuiz?.(num)
                    setShowQuizMode(false)
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#2E2E2E] hover:bg-[#CC785C] text-[#E5E5E0] hover:text-white transition-colors text-sm font-medium"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="border-t border-[#2E2E2E] bg-[#171717] p-4 max-h-32 overflow-y-auto">
          <div className="text-[11px] font-medium text-[#6B6B65] mb-2 uppercase">Output</div>
          <pre className="text-[#E5E5E0] text-xs font-mono whitespace-pre-wrap break-words">{output}</pre>
        </div>
      )}
    </div>
  )
}
