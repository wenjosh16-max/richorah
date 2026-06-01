import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function envoyerEmailNotification(message: {
  nom: string
  telephone: string
  email?: string | null
  message: string
  bienTitre?: string
}) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL

  if (!adminEmail) return

  try {
    await transporter.sendMail({
      from: `"Richorah Immobilier" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Nouveau message de ${message.nom} - Richorah`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom :</strong> ${message.nom}</p>
        <p><strong>Téléphone :</strong> ${message.telephone}</p>
        ${message.email ? `<p><strong>Email :</strong> ${message.email}</p>` : ""}
        ${message.bienTitre ? `<p><strong>Bien :</strong> ${message.bienTitre}</p>` : ""}
        <hr/>
        <p><strong>Message :</strong></p>
        <p>${message.message}</p>
      `,
    })
  } catch {
    console.error("Erreur envoi email notification")
  }
}
