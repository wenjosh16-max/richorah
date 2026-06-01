import { prisma } from "./prisma"

export async function ajouterEntree(action: string, description: string) {
  try {
    await prisma.journalActivite.create({
      data: { action, description },
    })
  } catch {
    console.error("Erreur journalisation")
  }
}
