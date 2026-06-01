"use server"

import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"
import { requireAdmin } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"

export async function updateBien(
  id: string,
  data: {
    titre?: string
    description?: string
    type?: string
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
  }
) {
  await requireAdmin()
  await prisma.bien.update({
    where: { id },
    data: {
      ...data,
      equipements: data.equipements ?? undefined,
      photos: data.photos ?? undefined,
    },
  })

  await ajouterEntree(
    "Modification de bien",
    `Le bien "${data.titre || id}" a été modifié`
  )

  revalidatePath("/admin/biens")
  revalidatePath(`/admin/biens/${id}/modifier`)
  revalidatePath("/")
  revalidatePath("/biens")
  return { success: true }
}
