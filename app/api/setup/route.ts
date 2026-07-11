import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const count = await prisma.admin.count()
  if (count > 0) {
    return NextResponse.json({
      exists: true,
      message: "Un administrateur existe déjà. Connectez-vous sur /admin/login.",
    })
  }

  const password = await bcrypt.hash("Richorah2024!", 12)
  await prisma.admin.create({
    data: {
      email: "admin@richorah.com",
      password,
    },
  })

  return NextResponse.json({
    exists: false,
    message: "Compte admin créé avec succès !",
    email: "admin@richorah.com",
    password: "Richorah2024!",
  })
}
