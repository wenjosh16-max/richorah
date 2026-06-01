"use server"

import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"
import { requireAdmin } from "@/lib/admin-guard"
import { slugify } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function createBien(data: {
  titre: string
  description?: string
  type: string
  prix?: number
  prixNegociable?: boolean
  prixSurDemande?: boolean
  ville?: string
  quartier?: string
  superficie?: number
  nbPieces?: number
  etage?: number
  equipements?: string[]
  latitude?: number
  longitude?: number
  statut?: string
  photos?: string[]
  slug?: string
  urlVisite360?: string
}) {
  await requireAdmin()
  const slug = data.slug || slugify(data.titre)

  const bien = await prisma.bien.create({
    data: {
      titre: data.titre,
      description: data.description || null,
      type: data.type || "vente",
      prix: data.prix || null,
      prixNegociable: data.prixNegociable ?? false,
      prixSurDemande: data.prixSurDemande ?? false,
      ville: data.ville || null,
      quartier: data.quartier || null,
      superficie: data.superficie || null,
      nbPieces: data.nbPieces || null,
      etage: data.etage || null,
      equipements: data.equipements || [],
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      statut: data.statut || "actif",
      photos: data.photos || [],
      slug,
      urlVisite360: data.urlVisite360 || null,
    },
  })

  await ajouterEntree(
    "Création de bien",
    `Le bien "${bien.titre}" a été créé`
  )

  revalidatePath("/admin/biens")
  revalidatePath("/")
  revalidatePath("/biens")
  return { success: true, id: bien.id }
}
