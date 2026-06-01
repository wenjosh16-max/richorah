import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
      <div className="text-center px-4">
        <div className="w-20 h-20 bg-[#FF385C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-[#FF385C]">?</span>
        </div>
        <h1 className="text-4xl font-bold text-[#1A1A2E] mb-2">Page introuvable</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-[#FF385C] hover:bg-[#E02D4F] gap-2">
              <Home className="h-4 w-4" /> Retour à l&apos;accueil
            </Button>
          </Link>
          <Link href="/biens">
            <Button variant="outline">Nos biens</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
