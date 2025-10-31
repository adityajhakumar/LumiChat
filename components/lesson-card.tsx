"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft, Copy, Check, CheckCircle } from "lucide-react"

interface LessonStep {
  title: string
  content: string
  type: "explanation" | "code" | "complexity" | "quiz"
}

interface LessonCardProps {
  steps: LessonStep[]
  onComplete?: () => void
  onCodeFeedback?: (code: string) => void
}

export default function LessonCard({ steps, onComplete, onCodeFeedback }: LessonCardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [copiedCode, setCopiedCode] = useState(false)
  const [userCode, setUserCode] = useState("")
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [quizMode, setQuizMode] = useState(false)
  const [quizData, setQuizData] = useState<any>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete?.()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(step.content)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleStartQuiz = async (numQuestions: number) => {
    // Quiz will be triggered from code editor
    setQuizMode(true)
  }

  const handleSubmitQuiz = () => {
    setShowResults(true)
  }

  const getPracticeProblems = () => {
    const lessonTopic = steps[0]?.title?.toLowerCase() || ""

    const problemMaps: { [key: string]: Array<{ name: string; url: string }> } = {
      "two sum": [
        { name: "LeetCode 1 - Two Sum", url: "https://leetcode.com/problems/two-sum/" },
        { name: "LeetCode 167 - Two Sum II", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
        { name: "LeetCode 3Sum", url: "https://leetcode.com/problems/3sum/" },
      ],
      "sliding window": [
        {
          name: "LeetCode 3 - Longest Substring",
          url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        },
        { name: "LeetCode 76 - Minimum Window", url: "https://leetcode.com/problems/minimum-window-substring/" },
        { name: "LeetCode 209 - Minimum Size", url: "https://leetcode.com/problems/minimum-size-subarray-sum/" },
      ],
      "binary search": [
        { name: "LeetCode 704 - Binary Search", url: "https://leetcode.com/problems/binary-search/" },
        { name: "LeetCode 33 - Search Rotated", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
        {
          name: "LeetCode 34 - Find Position",
          url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
        },
      ],
      "dynamic programming": [
        { name: "LeetCode 70 - Climbing Stairs", url: "https://leetcode.com/problems/climbing-stairs/" },
        { name: "LeetCode 198 - House Robber", url: "https://leetcode.com/problems/house-robber/" },
        { name: "LeetCode 322 - Coin Change", url: "https://leetcode.com/problems/coin-change/" },
      ],
    }

    for (const [key, problems] of Object.entries(problemMaps)) {
      if (lessonTopic.includes(key)) {
        return problems
      }
    }

    return []
  }

  const renderContent = () => {
    if (step.type === "code") {
      return (
        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={handleCopyCode}
              className="absolute top-2 right-2 p-2 bg-[#2E2E2E] hover:bg-[#3E3E3E] rounded transition-colors z-10"
              title="Copy code"
            >
              {copiedCode ? (
                <Check size={16} className="text-green-400" />
              ) : (
                <Copy size={16} className="text-[#9B9B95]" />
              )}
            </button>
            <pre className="bg-[#0D0D0D] rounded-lg p-4 overflow-x-auto border border-[#2E2E2E] max-h-96">
              <code className="text-[#E5E5E0] text-sm font-mono leading-relaxed whitespace-pre-wrap break-words">
                {step.content}
              </code>
            </pre>
          </div>
        </div>
      )
    }
    return <p className="text-[#9B9B95] leading-relaxed whitespace-pre-wrap">{step.content}</p>
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-6 border-b border-[#2E2E2E] flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-[#6B6B65] mb-1">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>•</span>
            <span className="capitalize">{step.type}</span>
          </div>
          <h2 className="text-xl font-bold text-[#E5E5E0]">{step.title}</h2>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="p-2 bg-[#2E2E2E] hover:bg-[#3E3E3E] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous step"
          >
            <ChevronLeft size={18} className="text-[#9B9B95]" />
          </button>

          {isLastStep ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-4 py-2 bg-[#CC785C] hover:bg-[#B8674A] rounded-lg text-white transition-colors font-medium"
              title="Complete lesson"
            >
              <CheckCircle size={18} />
              <span>Complete</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="p-2 bg-[#CC785C] hover:bg-[#B8674A] rounded transition-colors"
              title="Next step"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0D0D0D] rounded-lg p-6 border border-[#2E2E2E]">
            {renderContent()}
          </div>

          {quizMode && (
            <div className="mt-6 p-6 bg-[#0D0D0D] rounded-lg border border-[#2E2E2E]">
              <h3 className="text-xl font-bold text-[#E5E5E0] mb-4">Quiz Mode</h3>
              <p className="text-[#9B9B95] mb-4">Complete the quiz to unlock the next lesson.</p>
              <button
                onClick={handleSubmitQuiz}
                className="px-4 py-2 bg-[#CC785C] hover:bg-[#B8674A] rounded-lg text-white transition-colors"
              >
                Submit Quiz
              </button>
            </div>
          )}

          {showResults && (
            <div className="mt-6 p-6 bg-[#0D0D0D] rounded-lg border border-[#2E2E2E]">
              <h3 className="text-xl font-bold text-[#E5E5E0] mb-4">Quiz Results</h3>
              <p className="text-[#9B9B95]">You've completed the quiz! Continue to the next lesson.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
