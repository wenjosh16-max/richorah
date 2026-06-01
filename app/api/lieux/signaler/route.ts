import { NextResponse } from "next/server"
import { getLieuxDisponibles } from "@/lib/lieux"
import { ajouterEntree } from "@/lib/journal"

const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ville } = body

    if (!ville || typeof ville !== "string" || ville.trim().length < 2) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const location = ville.trim()

    const lieux = await getLieuxDisponibles()
    const searchNorm = normalize(location)
    const exists = lieux.some((l) => normalize(l.label).includes(searchNorm))

    if (!exists) {
      await ajouterEntree(
        "Recherche non trouvée",
        `Un client a recherché "${location}" mais aucun bien n'est disponible dans cette zone.`
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
