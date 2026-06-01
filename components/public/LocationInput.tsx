"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { LieuOption } from "@/lib/lieux"

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
  className?: string
  name?: string
}

export default function LocationInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Ville ou quartier...",
  className = "",
  name,
}: LocationInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<LieuOption[]>([])
  const [filtered, setFiltered] = useState<LieuOption[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/lieux")
      .then((r) => r.json())
      .then((data: LieuOption[]) => setOptions(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!value.trim()) {
      setFiltered(options)
      return
    }
    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    const q = normalize(value)
    const matches = options.filter(
      (o) => normalize(o.label).includes(q)
    )
    setFiltered(matches)
    setHighlightedIndex(-1)
  }, [value, options])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const select = useCallback(
    (option: LieuOption) => {
      onChange(option.value)
      setIsOpen(false)
      inputRef.current?.focus()
    },
    [onChange]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isOpen && filtered.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
        return
      }
      if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault()
        select(filtered[highlightedIndex])
        return
      }
      if (e.key === "Escape") {
        setIsOpen(false)
        return
      }
    }
    onKeyDown?.(e)
  }

  const showDropdown = isOpen && filtered.length > 0

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
          >
            {filtered.map((option, index) => (
              <button
                key={`${option.type}:${option.value}`}
                type="button"
                onClick={() => select(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${
                  index === highlightedIndex
                    ? "bg-[#FFF0F3] text-primary"
                    : "text-[#222] hover:bg-gray-50"
                }`}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span>{option.label}</span>
                {option.type === "quartier" && (
                  <span className="ml-auto text-[10px] text-gray-400 uppercase tracking-wider">Quartier</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
