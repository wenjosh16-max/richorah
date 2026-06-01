import { NextResponse } from "next/server"
import { getLieuxDisponibles } from "@/lib/lieux"

export const dynamic = "force-dynamic"

export async function GET() {
  const lieux = await getLieuxDisponibles()
  return NextResponse.json(lieux)
}
