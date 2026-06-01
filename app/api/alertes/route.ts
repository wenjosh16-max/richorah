import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const alertes = await prisma.alerteBien.findMany({
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(alertes)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, type, ville, budgetMax, superficieMin } = body

    if (!email) {
      return NextResponse.json(
        { error: "Email obligatoire" },
        { status: 400 }
      )
    }

    const alerte = await prisma.alerteBien.create({
      data: {
        email,
        type: type || null,
        ville: ville || null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        superficieMin: superficieMin ? Number(superficieMin) : null,
      },
    })

    await ajouterEntree(
      "Nouvelle alerte",
      `Alerte créée pour ${email}`
    )

    return NextResponse.json(alerte, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'alerte" },
      { status: 500 }
    )
  }
}
