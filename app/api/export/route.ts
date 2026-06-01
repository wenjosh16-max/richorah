import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const [biens, messages, alertes, contenus, temoignages, journal] =
    await Promise.all([
      prisma.bien.findMany({
        include: { promotions: { include: { promotion: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.message.findMany({
        include: { bien: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.alerteBien.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.contenu.findMany(),
      prisma.temoignage.findMany({ orderBy: { ordre: "asc" } }),
      prisma.journalActivite.findMany({ orderBy: { createdAt: "desc" } }),
    ])

  const data = { biens, messages, alertes, contenus, temoignages, journal }

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="richorah-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  })
}
