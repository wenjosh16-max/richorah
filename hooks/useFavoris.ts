"use client"

import { useState, useEffect, useCallback } from "react"

export function useFavoris() {
  const [favoris, setFavoris] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("richorah_favoris")
    if (stored) {
      try {
        setFavoris(JSON.parse(stored))
      } catch {
        setFavoris([])
      }
    }
  }, [])

  const toggleFavori = useCallback((slug: string) => {
    setFavoris((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
      localStorage.setItem("richorah_favoris", JSON.stringify(next))
      return next
    })
  }, [])

  const estFavori = useCallback(
    (slug: string) => favoris.includes(slug),
    [favoris]
  )

  const viderFavoris = useCallback(() => {
    setFavoris([])
    localStorage.removeItem("richorah_favoris")
  }, [])

  return { favoris, toggleFavori, estFavori, viderFavoris }
}
