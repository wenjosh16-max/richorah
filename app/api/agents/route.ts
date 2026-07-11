import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { ordre: "asc" },
    include: {
      _count: {
        select: { visites: true, transactions: true },
      },
    },
  })
  return NextResponse.json(agents)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const agent = await prisma.agent.create({
      data: {
        nom: body.nom,
        telephone: body.telephone,
        email: body.email || null,
        photo: body.photo || null,
        quartiers: body.quartiers || [],
        commissionPct: body.commissionPct ? parseFloat(body.commissionPct) : null,
        actif: body.actif !== false,
        ordre: body.ordre || 0,
      },
    })
    return NextResponse.json(agent)
  } catch (e) {
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
