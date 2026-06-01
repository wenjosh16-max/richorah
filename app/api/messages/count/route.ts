import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const count = await prisma.message.count({ where: { statut: "nouveau" } })

  const recent = await prisma.message.findMany({
    where: { statut: "nouveau" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      nom: true,
      telephone: true,
      message: true,
      createdAt: true,
      bienId: true,
    },
  })

  return NextResponse.json({ count, recent })
}
