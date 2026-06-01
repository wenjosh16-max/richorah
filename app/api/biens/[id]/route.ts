import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const bien = await prisma.bien.findUnique({
    where: { id },
  })

  if (!bien) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 })
  }

  return NextResponse.json(bien)
}
