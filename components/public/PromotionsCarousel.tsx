"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PromotionCarouselItem {
  id: string
  titre: string
  description?: string | null
  reduction: number
}

export default function PromotionsCarousel({ promotions }: { promotions: PromotionCarouselItem[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (promotions.length < 2) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promotions.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [promotions.length])

  if (!promotions.length) return null

  const promo = promotions[current]

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-primary rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
              <Zap className="h-3 w-3" />
              Offre limitée
            </span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {promo.titre}
              </h2>
              {promo.description && (
                <p className="text-white/80 text-sm mt-1">{promo.description}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <Button
          asChild
          className="relative bg-white text-primary hover:bg-gray-50 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-sm whitespace-nowrap"
        >
          <Link href={`/biens?promotionId=${promo.id}`}>
            Voir l&apos;offre <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
        {promotions.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {promotions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? "bg-white w-4" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
