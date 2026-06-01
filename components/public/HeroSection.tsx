"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LocationInput from "./LocationInput"
import Image from "next/image"

interface HeroSectionProps {
  contenu: Record<string, string>
}

export default function HeroSection({ contenu }: HeroSectionProps) {
  const router = useRouter()
  const [type, setType] = useState("")
  const [ville, setVille] = useState("")
  const [budget, setBudget] = useState("")
  const signalling = useRef(false)

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (ville && !signalling.current) {
        signalling.current = true
        try {
          await fetch("/api/lieux/signaler", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ville }),
          })
        } catch {}
      }
      const params = new URLSearchParams()
      if (type) params.set("type", type)
      if (ville) params.set("ville", ville)
      if (budget) params.set("budgetMax", budget)
      router.push(`/biens?${params.toString()}`)
    },
    [type, ville, budget, router]
  )

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt="Luxury home"
          fill
          className="object-cover scale-105"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-xs tracking-widest uppercase font-medium">
            Agence immobilière de prestige
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 leading-tight tracking-tight"
        >
          {contenu["slogan_hero"] || "Votre patrimoine, notre passion"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto font-light leading-relaxed"
        >
          {contenu["sous_slogan_hero"] || "Agence immobilière de confiance à Lomé, Togo"}
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          onSubmit={handleSearch}
          className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-6 max-w-3xl mx-auto shadow-2xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-12 rounded-xl px-4 bg-white/95 text-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF385C] appearance-none cursor-pointer"
              >
                <option value="">Type de bien</option>
                <option value="vente">Vente</option>
                <option value="location">Location</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative sm:col-span-2">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <LocationInput
                value={ville}
                onChange={setVille}
                placeholder="Ville, quartier..."
                className="h-12 pl-10 w-full rounded-xl bg-white/95 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium z-10">
                FCFA
              </span>
              <Input
                type="number"
                placeholder="Budget max"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="h-12 pl-14 rounded-xl bg-white/95 text-gray-800 focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-3 gap-2 bg-[#FF385C] hover:bg-[#E02D4F] text-white rounded-xl h-12 font-semibold shadow-lg shadow-[#FF385C]/25"
          >
            <Search className="h-5 w-5" />
            Rechercher
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-white/60 text-sm"
        >
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#FF385C] rounded-full" /> Vente
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#C9A84C] rounded-full" /> Location
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white/60 rounded-full" /> Promotion
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-1 text-white/40 text-xs tracking-widest uppercase">
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce" />
        </div>
      </motion.div>
    </section>
  )
}
