import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { prisma } from "./prisma"

export const TELEPHONE_STANDARD = "70 62 86 96"
export const TELEPHONE_STANDARD_2 = "97 55 55 82"
export const TELEPHONE_WHATSAPP = "22870628696"
export const EMAIL_CONTACT = "contact@richorah-immobilier.com"
export const EMAIL_NOTIFICATION = "Richorahimmobilier04@gmail.com"

let configCache: Record<string, string> | null = null

export async function getConfig(): Promise<Record<string, string>> {
  if (configCache) return configCache
  try {
    const params = await prisma.parametre.findMany()
    const obj: Record<string, string> = {}
    for (const p of params) obj[p.cle] = p.valeur
    configCache = obj
    return obj
  } catch {
    return {}
  }
}

export async function getTelephone(key: "standard" | "whatsapp" | "standard_2"): Promise<string> {
  const config = await getConfig()
  if (key === "standard") return config["telephone_standard"] || TELEPHONE_STANDARD
  if (key === "whatsapp") return config["telephone_whatsapp"] || TELEPHONE_WHATSAPP
  return config["telephone_standard_2"] || TELEPHONE_STANDARD_2
}

export function getTelephoneSync(key: "standard" | "whatsapp" | "standard_2"): string {
  if (key === "standard") return TELEPHONE_STANDARD
  if (key === "whatsapp") return TELEPHONE_WHATSAPP
  return TELEPHONE_STANDARD_2
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrix(prix: number | null | undefined, periode?: string | null): string {
  if (prix === null || prix === undefined) return ""
  const suffix: Record<string, string> = {
    mois: "/mois",
    jour: "/jour",
    an: "/an",
    nuit: "/nuit",
  }
  return prix.toLocaleString("fr-FR") + " FCFA" + (periode && suffix[periode] ? suffix[periode] : "")
}

export function formatBienPrix(bien: {
  prix?: number | null
  prixTexte?: string | null
  prixPeriode?: string | null
  prixSurDemande?: boolean
}): string {
  if (bien.prixTexte) return bien.prixTexte
  if (bien.prixSurDemande) return "Prix sur demande"
  if (bien.prix) return formatPrix(bien.prix, bien.prixPeriode)
  return "Prix sur demande"
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
