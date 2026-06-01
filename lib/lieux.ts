import { prisma } from "./prisma"
import { ajouterEntree } from "./journal"

export interface LieuOption {
  value: string
  label: string
  type: "ville" | "quartier"
}

export async function getLieuxDisponibles(): Promise<LieuOption[]> {
  const lieuxMap = new Map<string, LieuOption>()

  const quartiers = await prisma.quartier.findMany({
    where: { published: true },
    orderBy: { ordre: "asc" },
  })

  for (const q of quartiers) {
    lieuxMap.set(`quartier:${q.nom}`, { value: q.nom, label: q.nom, type: "quartier" })
  }

  const biens = await prisma.bien.findMany({
    where: { published: true },
    select: { ville: true, quartier: true },
  })

  for (const b of biens) {
    if (b.ville) {
      const key = `ville:${b.ville}`
      if (!lieuxMap.has(key)) {
        lieuxMap.set(key, { value: b.ville, label: b.ville, type: "ville" })
      }
    }
    if (b.quartier) {
      const key = `quartier:${b.quartier}`
      if (!lieuxMap.has(key)) {
        lieuxMap.set(key, { value: b.quartier, label: `${b.quartier} (quartier)`, type: "quartier" })
      }
    }
  }

  return Array.from(lieuxMap.values()).sort((a, b) => a.label.localeCompare(b.label, "fr"))
}

export async function signalerLocalisationManquante(location: string) {
  if (!location || location.trim().length < 2) return

  await ajouterEntree(
    "Recherche non trouvée",
    `Un client a recherché "${location.trim()}" mais aucun bien n'est disponible dans cette zone.`
  )
}
