import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      _count: { select: { visites: true, transactions: true } },
    },
  })
  if (!agent) {
    return NextResponse.json({ error: "Agent introuvable" }, { status: 404 })
  }
  return NextResponse.json(agent)
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
    const agent = await prisma.agent.update({
      where: { id },
      data: {
        nom: body.nom,
        telephone: body.telephone,
        email: body.email || null,
        photo: body.photo || null,
        quartiers: body.quartiers || [],
        commissionPct: body.commissionPct !== undefined ? parseFloat(body.commissionPct) : null,
        actif: body.actif !== false,
        ordre: body.ordre || 0,
      },
    })
    return NextResponse.json(agent)
  } catch {
    return NextResponse.json({ error: "Erreur lors de la modification" }, { status: 500 })
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
    await prisma.agent.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
  }
}
