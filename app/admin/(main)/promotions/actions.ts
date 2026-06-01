"use server"

import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"
import { requireAdmin } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"

export async function createPromotion(data: {
  titre: string
  description?: string
  reduction: number
  dateDebut: string
  dateFin: string
  bienIds?: string[]
}) {
  await requireAdmin()
  const promotion = await prisma.promotion.create({
    data: {
      titre: data.titre,
      description: data.description || null,
      reduction: data.reduction,
      dateDebut: new Date(data.dateDebut),
      dateFin: new Date(data.dateFin),
      biens: data.bienIds?.length
        ? {
            create: data.bienIds.map((bienId) => ({ bienId })),
          }
        : undefined,
    },
  })

  await ajouterEntree(
    "Création de promotion",
    `La promotion "${promotion.titre}" a été créée`
  )

  revalidatePath("/admin/promotions")
  revalidatePath("/")
  revalidatePath("/biens")
  return { success: true }
}

export async function togglePromotion(id: string, active: boolean) {
  await requireAdmin()
  await prisma.promotion.update({
    where: { id },
    data: { active },
  })

  await ajouterEntree(
    active ? "Activation promotion" : "Désactivation promotion",
    `La promotion ${id} est ${active ? "activée" : "désactivée"}`
  )

  revalidatePath("/admin/promotions")
  revalidatePath("/")
  revalidatePath("/biens")
}

export async function deletePromotion(id: string) {
  await requireAdmin()
  const promo = await prisma.promotion.findUnique({
    where: { id },
    select: { titre: true },
  })

  await prisma.promotion.delete({ where: { id } })

  await ajouterEntree(
    "Suppression de promotion",
    `La promotion "${promo?.titre || id}" a été supprimée`
  )

  revalidatePath("/admin/promotions")
  revalidatePath("/")
  revalidatePath("/biens")
}
