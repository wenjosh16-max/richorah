import { prisma } from "@/lib/prisma"
import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import WhatsAppButton from "@/components/public/WhatsAppButton"
import FloatingMessageButton from "@/components/public/FloatingMessageButton"

async function getLogo() {
  const contenu = await prisma.contenu.findUnique({ where: { cle: "logo_url" } })
  return contenu?.valeur || null
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const logoUrl = await getLogo()

  return (
    <>
      <Navbar logoUrl={logoUrl} />
      <main className="flex-1">{children}</main>
      <Footer logoUrl={logoUrl} />
      <WhatsAppButton />
      <FloatingMessageButton />
    </>
  )
}
