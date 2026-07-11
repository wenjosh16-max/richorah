import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slugsParam = searchParams.get("slugs")

  const where: Record<string, unknown> = { statut: "actif" }

  if (slugsParam) {
    const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean)
    if (slugs.length > 0) {
      where.slug = { in: slugs }
    }
  }

  const biens = await prisma.bien.findMany({
    where,
    select: {
      id: true,
      titre: true,
      slug: true,
      prix: true,
      prixSurDemande: true,
      prixPeriode: true,
      type: true,
      statut: true,
      ville: true,
      quartier: true,
      superficie: true,
      nbPieces: true,
      photos: true,
      vues: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(biens)
}
