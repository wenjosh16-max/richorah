import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrix(prix: number | null | undefined): string {
  if (prix === null || prix === undefined) return ""
  return prix.toLocaleString("fr-FR") + " FCFA"
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function genererTextePartage(bien: {
  titre: string
  ville?: string | null
  quartier?: string | null
  prix?: number | null
  superficie?: number | null
  nbPieces?: number | null
  equipements: string[]
  slug: string
  photoUrl?: string | null
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://richorah.vercel.app"
  const url = `${baseUrl}/biens/${bien.slug}`
  const lines = [
    `🏠 ${bien.titre}`,
    `📍 ${[bien.ville, bien.quartier].filter(Boolean).join(", ")}`,
    `💰 ${bien.prix ? formatPrix(bien.prix) : "Prix sur demande"}`,
    `📐 ${bien.superficie ? `${bien.superficie} m²` : ""}${bien.nbPieces ? ` · ${bien.nbPieces} pièces` : ""}`,
    `✅ ${bien.equipements.slice(0, 5).join(" · ")}`,
    ``,
    `👉 Voir l'annonce : ${url}`,
    `📞 Richorah Immobilier : 70 62 86 96`,
  ]
  if (bien.photoUrl) {
    lines.push(`📷 ${bien.photoUrl}`)
  }
  return lines.join("\n")
}

export function genererMessageWhatsApp(bien: { titre: string; slug: string }): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://richorah.vercel.app"
  const url = `${baseUrl}/biens/${bien.slug}`
  return encodeURIComponent(
    `Bonjour, je suis intéressé par le bien "${bien.titre}".\n\n${url}\n\nMerci de me contacter.`
  )
}
