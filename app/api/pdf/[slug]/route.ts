import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatPrix } from "@/lib/utils"
import jsPDF from "jspdf"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const bien = await prisma.bien.findUnique({
    where: { slug, published: true },
  })

  if (!bien) {
    return NextResponse.json({ error: "Bien introuvable" }, { status: 404 })
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(22)
  doc.text(bien.titre, pageWidth / 2, 25, { align: "center" })

  doc.setFontSize(14)
  const price = bien.prixSurDemande
    ? "Prix sur demande"
    : formatPrix(bien.prix)
  doc.text(price, pageWidth / 2, 35, { align: "center" })

  if (bien.ville) {
    doc.setFontSize(12)
    doc.text(`Ville : ${bien.ville}`, 15, 50)
  }
  if (bien.quartier) {
    doc.text(`Quartier : ${bien.quartier}`, 15, 58)
  }
  if (bien.superficie) {
    doc.text(`Superficie : ${bien.superficie} m²`, 15, 66)
  }
  if (bien.nbPieces) {
    doc.text(`Pièces : ${bien.nbPieces}`, 15, 74)
  }
  if (bien.etage !== null && bien.etage !== undefined) {
    doc.text(`Étage : ${bien.etage}`, 15, 82)
  }

  doc.setFontSize(12)
  doc.text("Équipements :", 15, 94)
  if (bien.equipements.length > 0) {
    doc.setFontSize(10)
    const equipText = bien.equipements.join(", ")
    const lines = doc.splitTextToSize(equipText, pageWidth - 30)
    doc.text(lines, 15, 102)
  }

  const descriptionY = bien.equipements.length > 0 ? 120 : 108
  doc.setFontSize(12)
  doc.text("Description :", 15, descriptionY)
  if (bien.description) {
    doc.setFontSize(10)
    const descLines = doc.splitTextToSize(bien.description, pageWidth - 30)
    const maxDescLines = 15
    doc.text(descLines.slice(0, maxDescLines), 15, descriptionY + 8)
  }

  const contactY = doc.internal.pageSize.getHeight() - 40
  doc.setFontSize(11)
  doc.text("Richorah Immobilier", pageWidth / 2, contactY, { align: "center" })
  doc.text("70 62 86 96", pageWidth / 2, contactY + 8, {
    align: "center",
  })

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slug}.pdf"`,
    },
  })
}
