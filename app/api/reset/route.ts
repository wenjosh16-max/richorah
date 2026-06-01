import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
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
}
