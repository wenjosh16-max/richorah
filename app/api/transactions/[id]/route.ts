import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ajouterEntree } from "@/lib/journal"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const { id } = await params
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      bien: { select: { id: true, titre: true, slug: true, photos: true } },
      agent: { select: { id: true, nom: true, telephone: true } },
    },
  })
  if (!transaction) {
    return NextResponse.json({ error: "Transaction introuvable" }, { status: 404 })
  }
  return NextResponse.json(transaction)
}

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
    if (body.agentId !== undefined) data.agentId = body.agentId
    if (body.montantTotal) data.montantTotal = parseFloat(body.montantTotal)
    if (body.commissionTotal !== undefined) data.commissionTotal = parseFloat(body.commissionTotal)
    if (body.partAgence !== undefined) data.partAgence = parseFloat(body.partAgence)
    if (body.partAgent !== undefined) data.partAgent = parseFloat(body.partAgent)
    if (body.statut) data.statut = body.statut
    if (body.dateSignature !== undefined) data.dateSignature = body.dateSignature ? new Date(body.dateSignature) : null
    if (body.dateEncaissement !== undefined) data.dateEncaissement = body.dateEncaissement ? new Date(body.dateEncaissement) : null
    if (body.notes !== undefined) data.notes = body.notes

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
      include: {
        bien: { select: { id: true, titre: true, slug: true } },
        agent: { select: { id: true, nom: true } },
      },
    })

    if (body.statut) {
      await ajouterEntree(
        "Transaction mise à jour",
        `Transaction passée au statut "${body.statut}"`
      )
    }

    return NextResponse.json(transaction)
  } catch {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const { id } = await params
  try {
    await prisma.transaction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
