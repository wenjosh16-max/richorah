import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const quartiers = await prisma.quartier.findMany({
    orderBy: { ordre: "asc" },
  })
  return NextResponse.json(quartiers)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nom, description, image, ordre } = body

    if (!nom || nom.trim().length < 2) {
      return NextResponse.json({ error: "Le nom doit contenir au moins 2 caractères" }, { status: 400 })
    }

    const slug = nom
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const quartier = await prisma.quartier.create({
      data: {
        nom: nom.trim(),
        description: description?.trim() || null,
        image: image?.trim() || null,
        slug,
        ordre: ordre ?? 0,
      },
    })

    return NextResponse.json(quartier, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ce quartier existe déjà" }, { status: 409 })
    }
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 })
  }
}
