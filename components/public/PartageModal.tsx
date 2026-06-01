"use client"

import { useState, useEffect } from "react"
import { X, Copy, Check, Share2, Image, Link, MessageCircle, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { genererTextePartage } from "@/lib/utils"
import type { BienData } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

interface PartageModalProps {
  bien: BienData
  isOpen: boolean
  onClose: () => void
}

export default function PartageModal({ bien, isOpen, onClose }: PartageModalProps) {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedText, setCopiedText] = useState(false)
  const [imageDownloaded, setImageDownloaded] = useState(false)

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/biens/${bien.slug}`
  const photoUrl = bien.photos[0] || null

  const textePartage = genererTextePartage({
    titre: bien.titre,
    ville: bien.ville,
    quartier: bien.quartier,
    prix: bien.prix ?? undefined,
    superficie: bien.superficie ?? undefined,
    nbPieces: bien.nbPieces ?? undefined,
    equipements: bien.equipements,
    slug: bien.slug,
    photoUrl,
  })

  useEffect(() => {
    if (!isOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isOpen, onClose])

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      // fallback
    }
  }

  async function handleCopyText() {
    try {
      await navigator.clipboard.writeText(textePartage)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch {
      // fallback
    }
  }

  function handleWhatsApp() {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(textePartage)}`
    window.open(waUrl, "_blank")
  }

  async function handleDownloadImage() {
    if (!bien.photos[0]) return
    try {
      const resp = await fetch(bien.photos[0])
      const blob = await resp.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `${bien.slug}.jpg`
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      // silencieux
    }
    setImageDownloaded(true)
    setTimeout(() => setImageDownloaded(false), 2000)
  }

  async function handleNativeShare() {
    if (!navigator.share) return
    try {
      const shareData: ShareData = { title: bien.titre, text: textePartage, url }
      if (photoUrl) {
        const resp = await fetch(photoUrl)
        const blob = await resp.blob()
        const file = new File([blob], `${bien.slug}.jpg`, { type: blob.type })
        shareData.files = [file]
      }
      await navigator.share(shareData)
    } catch {
      // silencieux
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#FF385C]/10 rounded-lg flex items-center justify-center">
                  <Share2 className="h-5 w-5 text-[#FF385C]" />
                </div>
                <h3 className="font-semibold text-[#1A1A2E] text-lg">Partager</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="bg-[#F8F7F4] rounded-lg p-3 mb-2">
                <p className="text-sm font-medium text-[#1A1A2E] line-clamp-1">
                  {bien.titre}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {bien.ville}{bien.quartier ? `, ${bien.quartier}` : ""}
                </p>
              </div>

              {typeof navigator !== "undefined" && "share" in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F7F4] transition-colors group"
                >
                  <div className="w-9 h-9 bg-[#FF385C]/10 rounded-lg flex items-center justify-center group-hover:bg-[#FF385C]/20 transition-colors">
                    <Smartphone className="h-5 w-5 text-[#FF385C]" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[#1A1A2E]">Tout partager</p>
                    <p className="text-xs text-gray-400">Partager avec la photo (mobile)</p>
                  </div>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F7F4] transition-colors group"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Link className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[#1A1A2E]">Copier le lien</p>
                  <p className="text-xs text-gray-400">Partager le lien direct</p>
                </div>
                {copiedLink ? (
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                ) : null}
              </button>

              <button
                onClick={handleCopyText}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F7F4] transition-colors group"
              >
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <Copy className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[#1A1A2E]">Copier le texte</p>
                  <p className="text-xs text-gray-400">Texte prêt à partager</p>
                </div>
                {copiedText ? (
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                ) : null}
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F7F4] transition-colors group"
              >
                <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[#1A1A2E]">WhatsApp</p>
                  <p className="text-xs text-gray-400">Partager sur WhatsApp</p>
                </div>
              </button>

              <button
                onClick={handleDownloadImage}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#F8F7F4] transition-colors group"
              >
                <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                  <Image className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-[#1A1A2E]">T&eacute;l&eacute;charger l&rsquo;image</p>
                  <p className="text-xs text-gray-400">Image du bien &agrave; partager</p>
                </div>
                {imageDownloaded ? (
                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                ) : null}
              </button>
            </div>

            <div className="p-4 border-t border-gray-100 bg-[#F8F7F4]">
              <Button onClick={onClose} variant="secondary" className="w-full">
                Fermer
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
