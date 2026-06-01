"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
      <div className="text-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-red-500">!</span>
        </div>
        <h1 className="text-4xl font-bold text-[#1A1A2E] mb-2">Une erreur est survenue</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Nous nous excusons pour la gêne. Veuillez réessayer ou revenir à l&apos;accueil.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} className="bg-[#FF385C] hover:bg-[#E02D4F]">
            Réessayer
          </Button>
          <Link href="/">
            <Button variant="outline">Accueil</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
