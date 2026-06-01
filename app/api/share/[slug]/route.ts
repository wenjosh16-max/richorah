import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { genererTextePartage, genererMessageWhatsApp } from "@/lib/utils"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const bien = await prisma.bien.findUnique({
    where: { slug, statut: "actif" },
    include: {
      promotions: {
        where: { promotion: { active: true } },
        include: { promotion: true },
      },
    },
  })

  if (!bien) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 })
  }

  const shareText = genererTextePartage({
    titre: bien.titre,
    ville: bien.ville,
    quartier: bien.quartier,
    prix: bien.prix,
    superficie: bien.superficie,
    nbPieces: bien.nbPieces,
    equipements: bien.equipements,
    slug: bien.slug,
  })

  const siteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/biens/${bien.slug}`
  const whatsappUrl = `https://wa.me/?text=${genererMessageWhatsApp({ titre: bien.titre, slug: bien.slug })}`

  return NextResponse.json({
    bien: {
      ...bien,
      promotion: bien.promotions[0]?.promotion || null,
    },
    shareText,
    whatsappUrl,
    siteUrl,
  })
}
