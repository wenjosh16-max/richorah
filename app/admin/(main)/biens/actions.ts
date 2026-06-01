"use server"

import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"
import { requireAdmin } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"

export async function changeStatut(bienId: string, statut: string) {
  await requireAdmin()
  await prisma.bien.update({
    where: { id: bienId },
    data: { statut },
  })

  await ajouterEntree(
    "Changement de statut",
    `Le bien ${bienId} est passé au statut "${statut}"`
  )

  revalidatePath("/admin/biens")
  revalidatePath("/")
  revalidatePath("/biens")
}

export async function deleteBien(bienId: string) {
  await requireAdmin()
  const bien = await prisma.bien.findUnique({
    where: { id: bienId },
    select: { titre: true },
  })

  await prisma.bien.delete({ where: { id: bienId } })

  await ajouterEntree(
    "Suppression de bien",
    `Le bien "${bien?.titre || bienId}" a été supprimé`
  )

  revalidatePath("/admin/biens")
  revalidatePath("/")
  revalidatePath("/biens")
}
