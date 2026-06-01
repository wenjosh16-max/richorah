import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

export async function GET() {
  const contenus = await prisma.contenu.findMany()

  const obj: Record<string, string> = {}
  for (const c of contenus) {
    obj[c.cle] = c.valeur
  }

  return NextResponse.json(obj)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = (await request.json()) as Record<string, string>

    for (const [cle, valeur] of Object.entries(body)) {
      await prisma.contenu.upsert({
        where: { cle },
        update: { valeur },
        create: { cle, valeur },
      })
    }

    await ajouterEntree(
      "Contenus mis à jour",
      `${Object.keys(body).length} clés mises à jour`
    )

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des contenus" },
      { status: 500 }
    )
  }
}
