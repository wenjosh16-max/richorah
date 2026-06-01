import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

export async function GET() {
  const promotions = await prisma.promotion.findMany({
    include: { biens: { include: { bien: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(promotions)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { titre, description, reduction, dateDebut, dateFin, bienIds } = body

    if (!titre || reduction === undefined || !dateDebut || !dateFin) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      )
    }

    const promotion = await prisma.promotion.create({
      data: {
        titre,
        description,
        reduction: Number(reduction),
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        biens: bienIds?.length
          ? { create: bienIds.map((bienId: string) => ({ bienId })) }
          : undefined,
      },
      include: { biens: { include: { bien: true } } },
    })

    await ajouterEntree(
      "Promotion créée",
      `Promotion "${titre}" - ${reduction}% de réduction`
    )

    return NextResponse.json(promotion, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de la promotion" },
      { status: 500 }
    )
  }
}
