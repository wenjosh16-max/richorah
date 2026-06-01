"use server"

import { prisma } from "@/lib/prisma"
import { envoyerEmailNotification } from "@/lib/nodemailer"

export async function envoyerMessage(formData: FormData): Promise<{ success: boolean; message: string }> {
  const nom = formData.get("nom") as string | null
  const telephone = formData.get("telephone") as string | null
  const email = formData.get("email") as string | null
  const message = formData.get("message") as string | null
  const bienId = formData.get("bienId") as string | null

  if (!nom || nom.trim().length < 2) {
    return { success: false, message: "Veuillez fournir un nom valide." }
  }

  if (!telephone || telephone.trim().length < 6) {
    return { success: false, message: "Veuillez fournir un numéro de téléphone valide." }
  }

  if (!message || message.trim().length < 10) {
    return { success: false, message: "Veuillez écrire un message d'au moins 10 caractères." }
  }

  try {
    await prisma.message.create({
      data: {
        nom: nom.trim(),
        telephone: telephone.trim(),
        email: email?.trim() || null,
        message: message.trim(),
        bienId: bienId || null,
      },
    })

    let bienTitre: string | undefined
    if (bienId) {
      const bien = await prisma.bien.findUnique({
        where: { id: bienId },
        select: { titre: true },
      })
      if (bien) bienTitre = bien.titre
    }

    await envoyerEmailNotification({
      nom: nom.trim(),
      telephone: telephone.trim(),
      email: email?.trim() || null,
      message: message.trim(),
      bienTitre,
    })

    return { success: true, message: "Votre message a été envoyé avec succès !" }
  } catch {
    return { success: false, message: "Une erreur est survenue. Veuillez réessayer." }
  }
}
