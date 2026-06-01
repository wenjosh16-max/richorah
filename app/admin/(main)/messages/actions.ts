"use server"

import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"
import { requireAdmin } from "@/lib/admin-guard"
import { revalidatePath } from "next/cache"

export async function updateMessageStatus(id: string, status: string) {
  await requireAdmin()
  await prisma.message.update({
    where: { id },
    data: { statut: status },
  })

  await ajouterEntree(
    "Changement statut message",
    `Le message ${id} est passé au statut "${status}"`
  )

  revalidatePath("/admin/messages")
}

export async function updateMessageNote(id: string, note: string) {
  await requireAdmin()
  await prisma.message.update({
    where: { id },
    data: { note },
  })

  revalidatePath("/admin/messages")
}
