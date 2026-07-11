import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

export async function GET() {
  const params = await prisma.parametre.findMany()
  const obj: Record<string, string> = {}
  for (const p of params) {
    obj[p.cle] = p.valeur
  }
  return NextResponse.json(obj)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { cle: string; valeur: string; type?: string }[]

    for (const item of body) {
      await prisma.parametre.upsert({
        where: { cle: item.cle },
        update: { valeur: item.valeur, type: item.type || "string" },
        create: { cle: item.cle, valeur: item.valeur, type: item.type || "string" },
      })
    }

    await ajouterEntree(
      "Paramètres mis à jour",
      `${body.length} paramètres modifiés`
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    )
  }
}
