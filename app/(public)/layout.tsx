import Navbar from "@/components/public/Navbar"
import Footer from "@/components/public/Footer"
import WhatsAppButton from "@/components/public/WhatsAppButton"
import FloatingMessageButton from "@/components/public/FloatingMessageButton"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <FloatingMessageButton />
    </>
  )
}
