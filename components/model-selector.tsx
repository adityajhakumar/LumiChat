"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, Code, Brain, Sparkles, MessageSquare, Bot, ChevronDown } from "lucide-react"

const MODELS = [
  // --- MULTIMODAL ---
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Experimental", shortName: "Gemini 2.0", provider: "Google", category: "Multimodal" },
  { id: "google/gemma-3n-e2b-it:free", name: "Gemma 3n E2B Instruct", shortName: "Gemma 3n", provider: "Google", category: "Multimodal" },
  { id: "google/gemma-3-4b-it:free", name: "Gemma 3 4B Instruct", shortName: "Gemma 3 4B", provider: "Google", category: "Multimodal" },
  { id: "google/gemma-3-12b-it:free", name: "Gemma 3 12B Instruct", shortName: "Gemma 3 12B", provider: "Google", category: "Multimodal" },
  { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B Instruct", shortName: "Gemma 27B", provider: "Google", category: "Multimodal" },
  { id: "qwen/qwen2.5-vl-32b-instruct:free", name: "Qwen2.5 VL 32B", shortName: "Qwen VL", provider: "Alibaba / Qwen", category: "Multimodal" },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron Nano 12B V2 VL", shortName: "Nemotron VL", provider: "NVIDIA", category: "Multimodal" },
  { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick", shortName: "Llama 4 Maverick", provider: "Meta", category: "Multimodal" },
  { id: "meta-llama/llama-4-scout:free", name: "Llama 4 Scout", shortName: "Llama 4 Scout", provider: "Meta", category: "Multimodal" },

  // --- REASONING ---
  { id: "deepseek/deepseek-r1-distill-llama-70b:free", name: "DeepSeek R1 Distill Llama 70B", shortName: "DeepSeek R1", provider: "DeepSeek", category: "Reasoning" },
  { id: "tngtech/deepseek-r1t2-chimera:free", name: "DeepSeek R1T2 Chimera", shortName: "DeepSeek Chimera", provider: "TNG Tech", category: "Reasoning" },
  { id: "alibaba/tongyi-deepresearch-30b-a3b:free", name: "Tongyi DeepResearch 30B", shortName: "Tongyi", provider: "Alibaba", category: "Reasoning" },
  { id: "arliai/qwq-32b-arliai-rpr-v1:free", name: "QwQ 32B RpR v1", shortName: "QwQ 32B", provider: "ArliAI", category: "Reasoning" },

  // --- CODING ---
  { id: "qwen/qwen3-coder:free", name: "Qwen 3 Coder", shortName: "Qwen Coder", provider: "Alibaba / Qwen", category: "Coding" },
  { id: "mistralai/devstral-small-2505:free", name: "DevStral Small 2505", shortName: "DevStral", provider: "Mistral", category: "Coding" },

  // --- AGENTIC ---
  { id: "openai/gpt-oss-20b:free", name: "GPT-OSS 20B", shortName: "GPT-OSS", provider: "OpenAI", category: "Agentic" },
  { id: "minimax/minimax-m2:free", name: "MiniMax M2", shortName: "MiniMax M2", provider: "MiniMax", category: "Agentic" },
  { id: "openrouter/andromeda-alpha", name: "Andromeda Alpha", shortName: "Andromeda", provider: "OpenRouter", category: "Agentic" },

  // --- GENERAL ---
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B Instruct", shortName: "Llama 3.2 3B", provider: "Meta", category: "General" },
  { id: "meta-llama/llama-3.3-8b-instruct:free", name: "Llama 3.3 8B Instruct", shortName: "Llama 3.3 8B", provider: "Meta", category: "General" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B Instruct", shortName: "Llama 3.3 70B", provider: "Meta", category: "General" },
  { id: "shisa-ai/shisa-v2-llama3.3-70b:free", name: "Shisa V2 Llama 3.3 70B", shortName: "Shisa V2", provider: "Shisa AI", category: "General" },
  { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small 3.1 24B", shortName: "Mistral 3.1", provider: "Mistral", category: "General" },
  { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: "Mistral Small 3.2 24B", shortName: "Mistral 3.2", provider: "Mistral", category: "General" },
  { id: "qwen/qwen3-14b:free", name: "Qwen3 14B Instruct", shortName: "Qwen3 14B", provider: "Alibaba / Qwen", category: "General" },
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "Nemotron Nano 9B V2", shortName: "Nemotron", provider: "NVIDIA", category: "General" },

  // --- CREATIVE ---
  { id: "moonshotai/kimi-k2:free", name: "Kimi K2 0711", shortName: "Kimi K2", provider: "MoonshotAI", category: "Creative" },
]

// ✅ Get category from model definition
function getCategory(model: typeof MODELS[0]) {
  return model.category
}

// 🎨 Icons for categories
function getIcon(category: string) {
  switch (category) {
    case "Coding":
      return <Code className="w-3.5 h-3.5" />
    case "Multimodal":
      return <Camera className="w-3.5 h-3.5" />
    case "Reasoning":
      return <Brain className="w-3.5 h-3.5" />
    case "Creative":
      return <Sparkles className="w-3.5 h-3.5" />
    case "Agentic":
      return <Bot className="w-3.5 h-3.5" />
    default:
      return <MessageSquare className="w-3.5 h-3.5" />
  }
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  hasImage = false,
}: {
  selectedModel: string
  onModelChange: (model: string) => void
  hasImage?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const groupedModels = MODELS.reduce((acc, model) => {
    const cat = getCategory(model)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(model)
    return acc
  }, {} as Record<string, typeof MODELS>)

  const currentModel = MODELS.find((m) => m.id === selectedModel)

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto px-3 py-2 rounded-lg bg-[#333333] hover:bg-[#3A3A3A] border border-[#444444] 
                   transition-colors flex items-center justify-between sm:justify-start gap-2 text-sm group"
      >
        <span className="text-[#E5E5E0] text-sm whitespace-nowrap">
          {currentModel?.shortName || "Select Model"}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#9B9B95] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute bottom-full left-0 mb-2 
                     bg-[#2A2A2A] border border-[#3A3A3A] rounded-xl shadow-2xl z-50 
                     max-h-[60vh] sm:max-h-[400px] overflow-y-auto w-full sm:min-w-[280px]"
        >
          {Object.entries(groupedModels).map(([category, models]) => (
            <div key={category}>
              <div className="px-3 py-2 text-[10px] uppercase font-semibold text-[#6B6B65] flex items-center gap-2 bg-[#1E1E1E] sticky top-0 z-10">
                {getIcon(category)} {category}
              </div>
              {models.map((model) => {
                const isRecommended = hasImage && model.category === "Multimodal"
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors 
                                flex flex-col gap-1 ${
                                  selectedModel === model.id
                                    ? "bg-[#3A3A3A] text-white"
                                    : "hover:bg-[#323232] text-[#E5E5E0]"
                                } ${isRecommended ? "border-l-2 border-[#CC785C]" : ""}`}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-[11px] text-[#6B6B65]">{model.provider}</div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
