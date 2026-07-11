import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { alerteId } = await request.json()

    const alerte = await prisma.alerteBien.findUnique({
      where: { id: alerteId },
    })

    if (!alerte) {
      return NextResponse.json({ error: "Alerte introuvable" }, { status: 404 })
    }

    const biensRecents = await prisma.bien.findMany({
      where: {
        statut: "actif",
        published: true,
        ...(alerte.type ? { type: alerte.type } : {}),
        ...(alerte.ville ? { ville: alerte.ville } : {}),
        ...(alerte.budgetMax ? { prix: { lte: alerte.budgetMax } } : {}),
        ...(alerte.superficieMin ? { superficie: { gte: alerte.superficieMin } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const biensHtml = biensRecents.length > 0
      ? biensRecents.map((b) =>
          `<li><a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://richorah.vercel.app"}/biens/${b.slug}" style="color:#FF385C">${b.titre}</a> ${b.prix ? `- ${b.prix.toLocaleString()} FCFA` : ""}</li>`
        ).join("")
      : "<li>Aucun bien trouvé pour le moment</li>"

    await transporter.sendMail({
      from: `"Richorah Immobilier" <${process.env.SMTP_USER}>`,
      to: alerte.email,
      subject: `Nouveaux biens disponibles - Richorah Immobilier`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF385C;">Nouveaux biens immobiliers</h2>
          <p>Bonjour,</p>
          <p>Voici les biens récents correspondant à vos critères :</p>
          ${alerte.type ? `<p><strong>Type :</strong> ${alerte.type}</p>` : ""}
          ${alerte.ville ? `<p><strong>Ville :</strong> ${alerte.ville}</p>` : ""}
          ${alerte.budgetMax ? `<p><strong>Budget max :</strong> ${alerte.budgetMax.toLocaleString()} FCFA</p>` : ""}
          ${alerte.superficieMin ? `<p><strong>Superficie min :</strong> ${alerte.superficieMin} m²</p>` : ""}
          <ul style="margin-top: 20px;">${biensHtml}</ul>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            Vous recevez cet email car vous êtes inscrit aux alertes Richorah Immobilier.
            <br/>© ${new Date().getFullYear()} Richorah Immobilier - Lomé, Togo
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, message: `Email envoyé à ${alerte.email}` })
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}
