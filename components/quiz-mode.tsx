"use client"

import { useState } from "react"
import { Check, X, ChevronRight, Award, XCircle } from "lucide-react"

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface QuizModeProps {
  quizData: {
    questions: Question[]
  }
  onComplete: () => void
  topic?: string
}

export default function QuizMode({ quizData, onComplete, topic }: QuizModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResults, setShowResults] = useState(false)

  const question = quizData.questions[currentQuestion]
  const isLastQuestion = currentQuestion === quizData.questions.length - 1
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
    quizData.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correct) {
        correct++
      }
    })
    return {
      correct,
      total: quizData.questions.length,
      percentage: Math.round((correct / quizData.questions.length) * 100),
    }
  }

  // ✅ Results screen
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
              <h3 className="text-3xl font-bold text-center mb-2">
                {passed ? "Congratulations!" : "Keep Learning!"}
              </h3>
              <p className="text-center text-[#9B9B95] mb-6">
                {passed
                  ? "You've demonstrated great understanding of the topic!"
                  : "Review the explanations below and try again."}
              </p>
              <div className="flex justify-center gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-[#CC785C]">{score.percentage}%</div>
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
              {quizData.questions.map((q, index) => {
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
                            <span className="font-medium text-[#CC785C]">Explanation: </span>
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
              className="w-full px-6 py-3 bg-[#CC785C] hover:bg-[#B8674A] rounded-lg text-white font-medium transition-colors"
            >
              Return to Lesson
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Quiz view
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#1E1E1E]">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#2E2E2E] flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-[#6B6B65] mb-1">
            <span>
              Question {currentQuestion + 1} of {quizData.questions.length}
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

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0D0D0D] rounded-lg p-6 border border-[#2E2E2E] mb-6">
            <h3 className="text-lg font-semibold text-[#E5E5E0] mb-6">{question.question}</h3>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswers[currentQuestion] === index
                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-[#CC785C] bg-[#2E2E2E]"
                        : "border-[#2E2E2E] bg-[#1E1E1E] hover:border-[#3E3E3E]"
                    }`}
                  >
                    <span className="text-[#E5E5E0] font-medium">{option}</span>
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
        <button
          onClick={handleNext}
          disabled={!hasAnswered}
          className="px-6 py-2 rounded-lg bg-[#CC785C] text-white hover:bg-[#B8674A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          {isLastQuestion ? "Submit Quiz" : "Next"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
