import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const biens = await prisma.bien.findMany({
    where: { published: true },
    select: {
      id: true,
      titre: true,
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(biens)
}
