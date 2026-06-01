import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()

    if (secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    await prisma.promotionBien.deleteMany()
    await prisma.promotion.deleteMany()
    await prisma.message.deleteMany()
    await prisma.alerteBien.deleteMany()
    await prisma.journalActivite.deleteMany()
    await prisma.bien.deleteMany()
    await prisma.contenu.deleteMany()

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur" }, { status: 500 })
  }
}
