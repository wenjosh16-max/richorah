import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

function genererCodeUnique(): string {
  const num = Math.floor(100000 + Math.random() * 900000)
  return `VIS-${num}`
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const statut = searchParams.get("statut")

  const where: Record<string, unknown> = {}
  if (statut) where.statut = statut

  const visites = await prisma.visite.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      bien: { select: { id: true, titre: true, slug: true, photos: true } },
      agent: { select: { id: true, nom: true, telephone: true } },
    },
  })

  return NextResponse.json(visites)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.bienId || !body.nomClient || !body.telClient) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    const codeUnique = genererCodeUnique()

    const visite = await prisma.visite.create({
      data: {
        codeUnique,
        bienId: body.bienId,
        nomClient: body.nomClient,
        telClient: body.telClient,
        emailClient: body.emailClient || null,
        message: body.message || null,
        creneau: body.creneau || "matin",
        circuitIds: body.circuitIds || [],
        frais: body.frais || null,
        statut: "demandee",
        statutPaiement: "en_attente",
      },
    })

    await ajouterEntree(
      "Nouvelle demande de visite",
      `${body.nomClient} a demandé une visite pour le bien ${body.bienId} (code: ${codeUnique})`
    )

    return NextResponse.json(visite)
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
