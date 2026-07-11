import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get("date") // YYYY-MM-DD
  const bienId = searchParams.get("bienId")

  if (!dateStr) {
    return NextResponse.json({ error: "Paramètre 'date' requis (YYYY-MM-DD)" }, { status: 400 })
  }

  const date = new Date(dateStr + "T00:00:00")
  const dayName = DAYS_FR[date.getDay()]

  const param = await prisma.parametre.findUnique({ where: { cle: "visite_creneaux" } })
  if (!param) {
    return NextResponse.json({ creneaux: [], dayName })
  }

  let schedule: Record<string, string[]> = {}
  try {
    schedule = JSON.parse(param.valeur)
  } catch {
    const heures = param.valeur.split(",").map((s) => s.trim()).filter(Boolean)
    schedule = Object.fromEntries(DAYS_FR.map((d) => [d, [...heures]]))
  }

  const dayHours: string[] = schedule[dayName] || []

  const where: Record<string, unknown> = {
    creneau: { startsWith: dateStr },
    statut: { notIn: ["annulee", "terminee"] },
  }
  if (bienId) where.bienId = bienId

  const booked = await prisma.visite.findMany({
    where,
    select: { creneau: true },
  })
  const bookedHours = new Set(booked.map((v) => v.creneau.split("-")[3]))

  const disponibles = dayHours.filter((h) => !bookedHours.has(h))

  return NextResponse.json({ creneaux: disponibles, dayName, schedule })
}
