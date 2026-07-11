import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (body.statut) data.statut = body.statut
    if (body.agentId !== undefined) data.agentId = body.agentId
    if (body.frais !== undefined) data.frais = parseFloat(body.frais) || null
    if (body.modePaiement) data.modePaiement = body.modePaiement
    if (body.statutPaiement) data.statutPaiement = body.statutPaiement
    if (body.note !== undefined) data.note = body.note ? parseInt(body.note) : null
    if (body.commentaire !== undefined) data.commentaire = body.commentaire
    if (body.creneau) data.creneau = body.creneau
    if (body.statutPaiement) data.statutPaiement = body.statutPaiement

    const visite = await prisma.visite.update({
      where: { id },
      data,
      include: {
        bien: { select: { id: true, titre: true, slug: true } },
        agent: { select: { id: true, nom: true, telephone: true } },
      },
    })

    if (body.statut) {
      await ajouterEntree(
        "Visite mise à jour",
        `Visite ${visite.codeUnique} passée au statut "${body.statut}"`
      )
    }

    return NextResponse.json(visite)
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}
