"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { formatPrix } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFavoris } from "@/hooks/useFavoris"
import type { BienData } from "@/types"
import {
  Home,
  MapPin,
  Ruler,
  Building2,
  Heart,
  Trash2,
  ArrowLeft,
} from "lucide-react"

export default function FavorisPage() {
  const { favoris, viderFavoris, estFavori } = useFavoris()
  const [biens, setBiens] = useState<BienData[]>([])
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    async function chargerBiens() {
      if (favoris.length === 0) {
        setBiens([])
        setChargement(false)
        return
      }

      try {
        const response = await fetch(
          `/api/biens?slugs=${encodeURIComponent(favoris.join(","))}`
        )
        if (response.ok) {
          const data = await response.json()
          setBiens(data)
        }
      } catch {
        setBiens([])
      } finally {
        setChargement(false)
      }
    }

    chargerBiens()
  }, [favoris])

  const biensFiltres = biens.filter((b) => estFavori(b.slug))

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-[#1A1A2E]">
              Mes favoris
            </h1>
            <p className="text-gray-600 mt-1">
              {favoris.length} bien{favoris.length !== 1 ? "s" : ""} enregistr&eacute;
              {favoris.length !== 1 ? "s" : ""}
            </p>
          </div>
          {favoris.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={viderFavoris}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" /> Vider les favoris
            </Button>
          )}
        </div>

        {chargement ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : biensFiltres.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              Aucun favori
            </h3>
            <p className="text-gray-500 mb-6">
              Vous n&apos;avez pas encore ajout&eacute; de biens &agrave; vos favoris.
              Parcourez notre catalogue pour en trouver.
            </p>
            <Link href="/biens">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Parcourir les biens
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {biensFiltres.map((bien) => (
              <div
                key={bien.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <Link
                  href={`/biens/${bien.slug}`}
                  className="block relative h-52 overflow-hidden"
                >
                  {bien.photos[0] ? (
                    <Image
                      src={bien.photos[0]}
                      alt={bien.titre}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge variant={bien.type === "vente" ? "default" : "info"}>
                      {bien.type === "vente" ? "Vente" : "Location"}
                    </Badge>
                    <Badge
                      variant={
                        bien.statut === "actif"
                          ? "success"
                          : bien.statut === "vendu"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {bien.statut === "actif"
                        ? "Actif"
                        : bien.statut === "vendu"
                          ? "Vendu"
                          : "Lou&eacute;"}
                    </Badge>
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/biens/${bien.slug}`}>
                    <h3 className="font-semibold text-[#1A1A2E] group-hover:text-[#FF385C] transition-colors line-clamp-1">
                      {bien.titre}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{bien.ville || "Lom&eacute;"}</span>
                  </div>

                  <div className="mt-3">
                    {bien.prixSurDemande ? (
                      <span className="text-lg font-medium text-gray-500">
                        Prix sur demande
                      </span>
                    ) : bien.prix ? (
                      <span className="text-xl font-bold text-[#FF385C]">
                        {formatPrix(bien.prix)}
                      </span>
                    ) : (
                      <span className="text-lg font-medium text-gray-500">
                        Prix sur demande
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {bien.superficie && (
                      <span className="flex items-center gap-1">
                        <Ruler className="h-3.5 w-3.5" /> {bien.superficie} m&sup2;
                      </span>
                    )}
                    {bien.nbPieces && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {bien.nbPieces} pi&egrave;ces
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
