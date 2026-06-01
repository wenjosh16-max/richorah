"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import type { BienData } from "@/types"
import PartageModal from "./PartageModal"

interface CardShareButtonProps {
  bien: BienData
  className?: string
}

export default function CardShareButton({ bien, className }: CardShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(true)
        }}
        className={`bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#222] px-2.5 py-1 rounded-full shadow-sm hover:bg-white transition-colors ${className || ""}`}
        title="Partager"
      >
        <Share2 className="h-3 w-3 inline mr-1" />
        Partager
      </button>
      <PartageModal
        bien={bien}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
