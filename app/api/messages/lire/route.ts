import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  await prisma.message.updateMany({
    where: { statut: "nouveau" },
    data: { statut: "lu" },
  })

  return NextResponse.json({ success: true })
}
