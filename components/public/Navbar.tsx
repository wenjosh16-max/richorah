"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Search, Building2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import LocationInput from "@/components/public/LocationInput"

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/biens", label: "Nos biens" },
  { href: "/promotions", label: "Promotions" },
  { href: "/quartiers", label: "Quartiers" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
]

export default function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [ville, setVille] = useState("")
  const [type, setType] = useState("")
  const [budget, setBudget] = useState("")
  const reporting = useRef(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleSearch = async () => {
    const params = new URLSearchParams()
    if (ville) params.set("ville", ville)
    if (type) params.set("type", type)
    if (budget) params.set("budgetMax", budget)
    const qs = params.toString()
    router.push(`/biens${qs ? `?${qs}` : ""}`)

    if (ville && !reporting.current) {
      reporting.current = true
      try {
        await fetch("/api/lieux/signaler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ville }),
        })
      } catch {}
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const isHome = pathname === "/"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100/80"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Richorah"
                className="h-9 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF385C] to-[#E02D4F] flex items-center justify-center shadow-md shadow-[#FF385C]/20 group-hover:shadow-lg group-hover:shadow-[#FF385C]/30 transition-all">
                  <Building2 className="h-4.5 w-4.5 text-white" />
                </div>
                <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled || !isHome ? "text-[#222]" : "text-white"}`}>
                  richorah
                </span>
                <span className={`hidden sm:inline text-[10px] font-medium tracking-widest uppercase ml-1 transition-colors ${scrolled || !isHome ? "text-[#717171]" : "text-white/50"}`}>
                  Immobilier
                </span>
              </>
            )}
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-all duration-200 relative py-1",
                    isActive
                      ? scrolled || !isHome ? "text-primary" : "text-white"
                      : scrolled || !isHome ? "text-[#717171] hover:text-[#222]" : "text-white/70 hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#FF385C] rounded-full"
                    />
                  )}
                </Link>
              )
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <div className={`flex items-center rounded-full shadow-sm transition-all duration-300 divide-x ${
              scrolled || !isHome
                ? "bg-white border border-gray-200 hover:shadow-md"
                : "bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20"
            }`}>
              <div className="relative px-3 py-2.5 min-w-[140px]">
                <LocationInput
                  value={ville}
                  onChange={setVille}
                  onKeyDown={handleKeyDown}
                  placeholder="Où ?"
                  className={`text-sm font-medium outline-none bg-transparent w-full placeholder:text-gray-400 ${scrolled || !isHome ? "text-[#222]" : "text-white placeholder:text-white/50"}`}
                />
              </div>
              <div className="relative px-4 py-2.5">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`text-sm outline-none bg-transparent w-20 appearance-none cursor-pointer ${scrolled || !isHome ? "text-gray-500" : "text-white/70"}`}
                >
                  <option value="">Type</option>
                  <option value="vente">Vente</option>
                  <option value="location">Location</option>
                </select>
              </div>
              <div className="relative px-4 py-2.5">
                <input
                  type="number"
                  placeholder="Budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`text-sm outline-none bg-transparent w-20 placeholder:text-gray-400 ${scrolled || !isHome ? "text-gray-500" : "text-white/70 placeholder:text-white/50"}`}
                />
              </div>
              <button
                onClick={handleSearch}
                className="m-1.5 w-9 h-9 rounded-full bg-[#FF385C] hover:bg-[#E02D4F] flex items-center justify-center text-white transition-colors flex-shrink-0 shadow-sm"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={`p-2 transition-colors ${scrolled || !isHome ? "text-[#222]" : "text-white"}`}
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 transition-colors ${scrolled || !isHome ? "text-[#222]" : "text-white"}`}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="lg:hidden pb-4 space-y-2">
            <div className="flex gap-2 flex-wrap">
              <div className="flex-1 min-w-[140px]">
                <LocationInput
                  value={ville}
                  onChange={setVille}
                  onKeyDown={handleKeyDown}
                  placeholder="Ville ou quartier..."
                  className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Type</option>
                <option value="vente">Vente</option>
                <option value="location">Location</option>
              </select>
              <input
                type="number"
                placeholder="Budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary w-24"
              />
            </div>
            <Button size="sm" onClick={handleSearch} className="w-full">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl shadow-lg overflow-hidden border-t border-gray-100"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => {
                const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "block font-medium py-2.5 transition-colors text-sm",
                      isActive ? "text-primary" : "text-[#222] hover:text-primary"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
