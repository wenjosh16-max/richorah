import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const DAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]

async function getSchedule(): Promise<Record<string, string[]>> {
  const param = await prisma.parametre.findUnique({ where: { cle: "visite_creneaux" } })
  if (!param?.valeur) {
    const defaults = ["9:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"]
    return Object.fromEntries(DAYS_FR.map((d) => [d, d !== "dimanche" && d !== "samedi" ? [...defaults] : d === "samedi" ? ["9:00", "10:00", "11:00"] : []]))
  }

  try { return JSON.parse(param.valeur) } catch {
    const heures = param.valeur.split(",").map((s: string) => s.trim()).filter(Boolean)
    return Object.fromEntries(DAYS_FR.map((d) => [d, [...heures]]))
  }
}

async function getExceptions(): Promise<Record<string, string[]>> {
  const param = await prisma.parametre.findUnique({ where: { cle: "visite_creneaux_exceptions" } })
  if (!param?.valeur) return {}
  try { return JSON.parse(param.valeur) } catch { return {} }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get("date")
  const mois = searchParams.get("mois")
  const bienId = searchParams.get("bienId")

  const schedule = await getSchedule()
  const exceptions = await getExceptions()

  if (dateStr) {
    const date = new Date(dateStr + "T00:00:00")
    const dayName = DAYS_FR[date.getDay()]

    let dayHours: string[] = []
    if (exceptions[dateStr]) {
      dayHours = exceptions[dateStr]
    } else {
      dayHours = schedule[dayName] || []
    }

    const where: Record<string, unknown> = {
      creneau: { startsWith: dateStr },
      statut: { notIn: ["annulee", "terminee"] },
    }
    if (bienId) where.bienId = bienId

    const booked = await prisma.visite.findMany({ where, select: { creneau: true } })
    const bookedHours = new Set(booked.map((v) => v.creneau.split("-")[3]))

    const disponibles = dayHours.filter((h) => !bookedHours.has(h))

    return NextResponse.json({ date: dateStr, dayName, creneaux: disponibles, total: dayHours.length })
  }

  if (mois) {
    const [yearStr, monthStr] = mois.split("-")
    const year = parseInt(yearStr)
    const month = parseInt(monthStr) - 1
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const where: Record<string, unknown> = {
      statut: { notIn: ["annulee", "terminee"] },
    }
    if (bienId) where.bienId = bienId

    const booked = await prisma.visite.findMany({
      where,
      select: { creneau: true },
    })

    const bookedByDate: Record<string, Set<string>> = {}
    for (const v of booked) {
      if (v.creneau.includes("-") && v.creneau.split("-").length >= 4) {
        const parts = v.creneau.split("-")
        const d = parts.slice(0, 3).join("-")
        const h = parts[3]
        if (!bookedByDate[d]) bookedByDate[d] = new Set()
        bookedByDate[d].add(h)
      }
    }

    const joursDisponibles: { date: string; creneaux: string[]; count: number }[] = []

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStrLocal = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const date = new Date(year, month, d)
      const dayName = DAYS_FR[date.getDay()]

      let dayHours: string[] = []
      if (exceptions[dateStrLocal]) {
        dayHours = exceptions[dateStrLocal]
      } else {
        dayHours = schedule[dayName] || []
      }

      const bookedSet = bookedByDate[dateStrLocal] || new Set()
      const disponibles = dayHours.filter((h) => !bookedSet.has(h))

      if (disponibles.length > 0) {
        joursDisponibles.push({ date: dateStrLocal, creneaux: disponibles, count: disponibles.length })
      }
    }

    return NextResponse.json({ mois, joursDisponibles })
  }

  return NextResponse.json({ error: "Paramètre 'date' ou 'mois' requis" }, { status: 400 })
}
