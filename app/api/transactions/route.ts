import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bien: { select: { id: true, titre: true, slug: true, photos: true, prix: true } },
      agent: { select: { id: true, nom: true, telephone: true } },
    },
  })

  return NextResponse.json(transactions)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.bienId || !body.montantTotal || !body.type) {
      return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        bienId: body.bienId,
        agentId: body.agentId || null,
        type: body.type,
        montantTotal: parseFloat(body.montantTotal),
        commissionTotal: parseFloat(body.commissionTotal || "0"),
        partAgence: parseFloat(body.partAgence || "0"),
        partAgent: parseFloat(body.partAgent || "0"),
        statut: body.statut || "negociation",
        dateSignature: body.dateSignature ? new Date(body.dateSignature) : null,
        dateEncaissement: body.dateEncaissement ? new Date(body.dateEncaissement) : null,
        notes: body.notes || null,
      },
    })

    await ajouterEntree(
      "Nouvelle transaction créée",
      `Transaction ${body.type} - ${body.montantTotal.toLocaleString()} FCFA`
    )

    return NextResponse.json(transaction)
  } catch {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
