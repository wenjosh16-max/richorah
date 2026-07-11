"use server"

import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"
import { requireAdmin } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"

export async function saveParametres(data: { cle: string; valeur: string; type?: string }[]) {
  await requireAdmin()
  for (const item of data) {
    await prisma.parametre.upsert({
      where: { cle: item.cle },
      update: { valeur: item.valeur, type: item.type || "string" },
      create: { cle: item.cle, valeur: item.valeur, type: item.type || "string" },
    })
  }

  await ajouterEntree(
    "Paramètres mis à jour",
    `${data.length} paramètres modifiés`
  )

  revalidatePath("/admin/parametres")
  return { success: true }
}
