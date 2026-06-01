"use client"

import { useState } from "react"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import PartageModal from "@/components/public/PartageModal"
import type { BienData } from "@/types"

interface ClientShareButtonProps {
  bien: BienData
}

export default function ClientShareButton({ bien }: ClientShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" className="gap-2" onClick={() => setIsOpen(true)}>
        <Share2 className="h-4 w-4" />
        Partager
      </Button>
      <PartageModal
        bien={bien}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
