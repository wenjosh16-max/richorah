import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const temoignages = await prisma.temoignage.findMany({
    orderBy: { ordre: "asc" },
  })
  return NextResponse.json(temoignages)
}
