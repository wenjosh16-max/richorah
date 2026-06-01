"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import LocationInput from "./LocationInput"

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
        } catch {
          /* silencieux */
        }
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
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A2E]/70 via-[#1A1A2E]/50 to-[#1A1A2E]/80" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 leading-tight"
        >
          {contenu["slogan_hero"] || "Votre patrimoine, notre passion"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
        >
          {contenu["sous_slogan_hero"] ||
            "Agence immobilière de confiance à Lomé, Togo"}
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onSubmit={handleSearch}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-12 rounded-lg px-4 bg-white text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
            >
              <option value="">Type de bien</option>
              <option value="vente">Vente</option>
              <option value="location">Location</option>
            </select>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
              <LocationInput
                value={ville}
                onChange={setVille}
                placeholder="Ville, quartier..."
                className="h-12 pl-9 w-full rounded-lg bg-white text-[#1A1A2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
              />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                FCFA
              </span>
              <Input
                type="number"
                placeholder="Budget max"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="h-12 pl-12"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full mt-3 gap-2 bg-[#FF385C] hover:bg-[#E02D4F] text-white"
          >
            <Search className="h-5 w-5" />
            Rechercher
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4 text-white/80 text-sm"
        >
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full" /> Vente
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-400 rounded-full" /> Location
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#FF385C] rounded-full" /> Promotion
          </span>
        </motion.div>
      </div>
    </section>
  )
}
