import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const EXCEPTIONS_KEY = "visite_creneaux_exceptions"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get("date")

  const param = await prisma.parametre.findUnique({ where: { cle: EXCEPTIONS_KEY } })
  let exceptions: Record<string, string[]> = {}
  if (param?.valeur) {
    try { exceptions = JSON.parse(param.valeur) } catch {}
  }

  if (dateStr) {
    return NextResponse.json({ date: dateStr, heures: exceptions[dateStr] || [] })
  }

  return NextResponse.json({ exceptions })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await request.json()
  const { date, heures } = body

  if (!date || !Array.isArray(heures)) {
    return NextResponse.json({ error: "date (YYYY-MM-DD) et heures (string[]) requis" }, { status: 400 })
  }

  const param = await prisma.parametre.findUnique({ where: { cle: EXCEPTIONS_KEY } })
  let exceptions: Record<string, string[]> = {}
  if (param?.valeur) {
    try { exceptions = JSON.parse(param.valeur) } catch {}
  }

  exceptions[date] = heures

  await prisma.parametre.upsert({
    where: { cle: EXCEPTIONS_KEY },
    update: { valeur: JSON.stringify(exceptions) },
    create: { cle: EXCEPTIONS_KEY, valeur: JSON.stringify(exceptions), type: "string" },
  })

  return NextResponse.json({ success: true, date, heures })
}

export async function DELETE(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get("date")

  const param = await prisma.parametre.findUnique({ where: { cle: EXCEPTIONS_KEY } })
  if (!param?.valeur) return NextResponse.json({ success: true })

  let exceptions: Record<string, string[]> = {}
  try { exceptions = JSON.parse(param.valeur) } catch {}

  if (dateStr) {
    delete exceptions[dateStr]
  }

  await prisma.parametre.upsert({
    where: { cle: EXCEPTIONS_KEY },
    update: { valeur: JSON.stringify(exceptions) },
    create: { cle: EXCEPTIONS_KEY, valeur: JSON.stringify(exceptions), type: "string" },
  })

  return NextResponse.json({ success: true })
}
