import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const messages = await prisma.message.findMany({
    include: { bien: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(messages)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nom, telephone, email, message, bienId } = body

    if (!nom || !telephone || !message) {
      return NextResponse.json(
        { error: "Nom, téléphone et message sont obligatoires" },
        { status: 400 }
      )
    }

    const msg = await prisma.message.create({
      data: { nom, telephone, email, message, bienId },
    })

    await ajouterEntree(
      "Nouveau message",
      `Message de ${nom}${bienId ? " pour un bien" : ""}`
    )

    return NextResponse.json(msg, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création du message" },
      { status: 500 }
    )
  }
}
