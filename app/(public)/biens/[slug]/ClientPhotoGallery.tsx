"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ClientPhotoGalleryProps {
  photos: string[]
  titre: string
}

export default function ClientPhotoGallery({ photos, titre }: ClientPhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const hasMultiple = photos.length > 1

  function nextPhoto() {
    setSelectedIndex((prev) => (prev + 1) % photos.length)
  }

  function prevPhoto() {
    setSelectedIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  if (photos.length === 0) {
    return (
      <div className="bg-[#1A1A2E] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-700 rounded-xl flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-lg">Aucune photo disponible</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1A1A2E] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={photos[selectedIndex]}
            alt={`${titre} - Photo ${selectedIndex + 1}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 80vw"
          />
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevPhoto() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Photo précédente"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextPhoto() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                aria-label="Photo suivante"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                {selectedIndex + 1} / {photos.length}
              </div>
            </>
          )}
        </div>

        {hasMultiple && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`relative shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                  index === selectedIndex
                    ? "ring-2 ring-[#FF385C] ring-offset-2 ring-offset-[#1A1A2E]"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={photo}
                  alt={`${titre} - Miniature ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>

            <div
              className="relative w-full h-full max-w-5xl max-h-[85vh] m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[selectedIndex]}
                alt={`${titre} - Photo ${selectedIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 80vw"
              />
            </div>

            {hasMultiple && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevPhoto() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextPhoto() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1.5 rounded-full">
                  {selectedIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
