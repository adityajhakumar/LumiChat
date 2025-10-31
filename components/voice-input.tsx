"use client"

import { useState, useRef } from "react"
import { Mic } from "lucide-react"

interface VoiceInputProps {
  onTranscript: (text: string) => void
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser")
      return
    }

    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false

    recognitionRef.current.onstart = () => setIsListening(true)
    recognitionRef.current.onend = () => setIsListening(false)

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("")
      onTranscript(transcript + " ")
    }

    recognitionRef.current.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
  }

  return (
    <>
      <style>{`
        @keyframes ping-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        @keyframes ping-medium {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.05;
          }
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-ping-medium {
          animation: ping-medium 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 0.2s;
        }
      `}</style>

      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className="relative p-2 rounded-lg transition-colors bg-transparent hover:bg-[#3A3A3A] text-[#9B9B95] hover:text-[#E5E5E0]"
        title="Voice input"
      >
        {/* Pulsing rings when listening */}
        {isListening && (
          <>
            {/* Outer ring - slow pulse */}
            <span className="absolute inset-0 rounded-lg bg-[#CC785C] opacity-20 animate-ping-slow" />
            
            {/* Middle ring - medium pulse */}
            <span className="absolute inset-0 rounded-lg bg-[#CC785C] opacity-30 animate-ping-medium" />
            
            {/* Inner glow */}
            <span className="absolute inset-0 rounded-lg bg-[#CC785C] opacity-40" />
          </>
        )}

        {/* Microphone icon */}
        <Mic 
          size={20} 
          strokeWidth={1.5} 
          className={`relative z-10 transition-colors ${
            isListening ? "text-white" : ""
          }`}
        />
      </button>
    </>
  )
}
