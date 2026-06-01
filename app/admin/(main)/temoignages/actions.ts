"use server"

import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"
import { requireAdmin } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"

export async function createTemoignage(data: {
  nom: string
  texte: string
  etoiles: number
  ordre?: number
}) {
  await requireAdmin()
  const temoignage = await prisma.temoignage.create({
    data: {
      nom: data.nom,
      texte: data.texte,
      etoiles: data.etoiles,
      ordre: data.ordre || 0,
    },
  })

  await ajouterEntree(
    "Création de témoignage",
    `Le témoignage de "${temoignage.nom}" a été créé`
  )

  revalidatePath("/admin/temoignages")
  revalidatePath("/")
  return { success: true }
}

export async function updateTemoignage(
  id: string,
  data: {
    nom?: string
    texte?: string
    etoiles?: number
    ordre?: number
    actif?: boolean
  }
) {
  await requireAdmin()
  await prisma.temoignage.update({
    where: { id },
    data,
  })

  await ajouterEntree(
    "Modification de témoignage",
    `Le témoignage ${id} a été modifié`
  )

  revalidatePath("/admin/temoignages")
  revalidatePath("/")
}

export async function deleteTemoignage(id: string) {
  await requireAdmin()
  const t = await prisma.temoignage.findUnique({
    where: { id },
    select: { nom: true },
  })

  await prisma.temoignage.delete({ where: { id } })

  await ajouterEntree(
    "Suppression de témoignage",
    `Le témoignage de "${t?.nom || id}" a été supprimé`
  )

  revalidatePath("/admin/temoignages")
  revalidatePath("/")
}

export async function toggleTemoignage(id: string, actif: boolean) {
  await requireAdmin()
  await prisma.temoignage.update({
    where: { id },
    data: { actif },
  })

  await ajouterEntree(
    actif ? "Activation témoignage" : "Désactivation témoignage",
    `Le témoignage ${id} est ${actif ? "activé" : "désactivé"}`
  )

  revalidatePath("/admin/temoignages")
  revalidatePath("/")
}
