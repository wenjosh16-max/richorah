import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import PwaRegister from "@/components/PwaRegister"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://richorah.vercel.app"),
  title: {
    default: "Richorah Immobilier | Agence immobilière à Lomé, Togo",
    template: "%s | Richorah Immobilier",
  },
  description:
    "Agence immobilière de confiance à Lomé, Togo. Vente, location et gestion de biens immobiliers. Découvrez nos offres exclusives.",
  keywords: ["immobilier", "Lomé", "Togo", "vente", "location", "agence immobilière", "Richorah"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Richorah",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "256x256" },
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: "/icons/icon-192.svg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Richorah Immobilier",
    title: "Richorah Immobilier | Agence immobilière à Lomé, Togo",
    description: "Agence immobilière de confiance à Lomé, Togo. Vente, location et gestion de biens immobiliers.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF385C",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  )
}
