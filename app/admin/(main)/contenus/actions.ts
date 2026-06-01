"use server"

import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"
import { requireAdmin } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"

export async function saveContenu(data: Record<string, string>) {
  await requireAdmin()
  for (const [cle, valeur] of Object.entries(data)) {
    await prisma.contenu.upsert({
      where: { cle },
      update: { valeur },
      create: { cle, valeur },
    })
  }

  await ajouterEntree(
    "Mise à jour des contenus",
    `Les contenus du site ont été mis à jour (${Object.keys(data).length} champs)`
  )

  revalidatePath("/admin/contenus")
  return { success: true }
}
