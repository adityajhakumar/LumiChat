"use client"

import type React from "react"
import { useRef } from "react"
import { Image } from "lucide-react"

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void
}

export default function ImageUpload({ onImageSelect }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imageData = event.target?.result as string
      onImageSelect(imageData)
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-lg bg-transparent hover:bg-[#3A3A3A] text-[#9B9B95] hover:text-[#E5E5E0] transition-colors"
        title="Attach image"
      >
        <Image size={20} strokeWidth={1.5} />
      </button>
    </>
  )
}
