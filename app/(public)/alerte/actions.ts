"use server"

import { prisma } from "@/lib/prisma"

export async function creerAlerte(formData: FormData): Promise<{ success: boolean; message: string }> {
  const email = formData.get("email") as string | null
  const type = formData.get("type") as string | null
  const ville = formData.get("ville") as string | null
  const budgetMaxStr = formData.get("budgetMax") as string | null
  const superficieMinStr = formData.get("superficieMin") as string | null

  if (!email || !email.includes("@")) {
    return { success: false, message: "Veuillez fournir un email valide." }
  }

  const budgetMax = budgetMaxStr ? Number(budgetMaxStr) : null
  const superficieMin = superficieMinStr ? Number(superficieMinStr) : null

  if (budgetMax !== null && isNaN(budgetMax)) {
    return { success: false, message: "Budget maximum invalide." }
  }

  if (superficieMin !== null && isNaN(superficieMin)) {
    return { success: false, message: "Superficie minimale invalide." }
  }

  try {
    await prisma.alerteBien.create({
      data: {
        email,
        type: type || null,
        ville: ville || null,
        budgetMax: budgetMax,
        superficieMin: superficieMin,
      },
    })

    return { success: true, message: "Votre alerte a été créée avec succès !" }
  } catch {
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." }
  }
}
