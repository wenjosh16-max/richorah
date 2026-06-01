"use client"

import { Heart } from "lucide-react"
import { useFavoris } from "@/hooks/useFavoris"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  slug: string
  className?: string
}

export default function FavoriteButton({ slug, className }: FavoriteButtonProps) {
  const { estFavori, toggleFavori } = useFavoris()
  const isFavorite = estFavori(slug)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavori(slug)
      }}
      className={cn(
        "shrink-0 p-1.5 rounded-full transition-all duration-200 hover:scale-110",
        isFavorite
          ? "text-red-500 bg-red-50 hover:bg-red-100"
          : "text-gray-400 bg-white/80 hover:bg-gray-100 hover:text-red-400",
        className
      )}
      aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        className={cn("h-5 w-5 transition-all", isFavorite && "fill-red-500")}
      />
    </button>
  )
}
