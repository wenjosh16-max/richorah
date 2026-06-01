"use client"

import { useState, useCallback } from "react"
import type { FiltresRecherche } from "@/types"

export function useRecherche() {
  const [filtres, setFiltres] = useState<FiltresRecherche>({})
  const [page, setPage] = useState(1)

  const mettreAJourFiltres = useCallback(
    (nouveauxFiltres: Partial<FiltresRecherche>) => {
      setFiltres((prev) => ({ ...prev, ...nouveauxFiltres }))
      setPage(1)
    },
    []
  )

  const reinitialiserFiltres = useCallback(() => {
    setFiltres({})
    setPage(1)
  }, [])

  return { filtres, page, setPage, mettreAJourFiltres, reinitialiserFiltres }
}
