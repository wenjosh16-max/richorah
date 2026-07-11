import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const count = await prisma.admin.count()
  if (count > 0) {
    const admin = await prisma.admin.findFirst()
    return NextResponse.json({
      exists: true,
      message: "Un administrateur existe déjà. Utilisez POST /api/setup pour réinitialiser le mot de passe.",
      email: admin?.email,
    })
  }

  const password = await bcrypt.hash("Richorah2024!", 12)
  await prisma.admin.create({
    data: { email: "admin@richorah.com", password },
  })

  return NextResponse.json({
    exists: false,
    message: "Compte admin créé avec succès !",
    email: "admin@richorah.com",
    password: "Richorah2024!",
  })
}

export async function POST() {
  const admin = await prisma.admin.findFirst()
  if (!admin) {
    return NextResponse.json({ error: "Aucun admin trouvé. Utilisez GET /api/setup pour en créer un." }, { status: 404 })
  }

  const password = await bcrypt.hash("Richorah2024!", 12)
  await prisma.admin.update({
    where: { id: admin.id },
    data: { password },
  })

  return NextResponse.json({
    success: true,
    message: "Mot de passe réinitialisé avec succès !",
    email: admin.email,
    password: "Richorah2024!",
  })
}
