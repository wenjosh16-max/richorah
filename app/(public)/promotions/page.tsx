export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatPrix } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Zap, Home, MapPin, Ruler, Building2, ArrowRight, Percent, Calendar } from "lucide-react"

async function getActivePromotions() {
  const now = new Date()
  return prisma.promotion.findMany({
    where: {
      active: true,
      dateDebut: { lte: now },
      dateFin: { gte: now },
    },
    include: {
      biens: {
        include: { bien: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function PromotionsPage() {
  const promotions = await getActivePromotions()

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <section className="relative py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1920&q=80"
            alt="Promotions immobilières"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 bg-[#FF385C]/20 backdrop-blur-md border border-[#FF385C]/30 rounded-full text-white text-xs tracking-widest uppercase font-medium mb-4">
            <Percent className="h-3 w-3 inline mr-1" /> Offres spéciales
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">
            Promotions
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Profitez de nos offres promotionnelles sur une sélection de biens.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {promotions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Percent className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
              Aucune promotion active
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Revenez bientôt pour découvrir nos offres spéciales et promotions exclusives.
            </p>
            <Link href="/biens">
              <Button className="bg-[#FF385C] hover:bg-[#E02D4F]">Voir nos biens</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {promotions.map((promo) => {
              const joursRestants = Math.ceil(
                (new Date(promo.dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )

              return (
                <div
                  key={promo.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="bg-gradient-to-r from-primary to-[#E02D4F] p-6 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 bg-white/20 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        <Zap className="h-3 w-3" />
                        Promotion
                      </span>
                      <span className="text-2xl font-bold">-{promo.reduction}%</span>
                    </div>
                    <h2 className="text-xl font-bold">{promo.titre}</h2>
                    {promo.description && (
                      <p className="text-white/80 text-sm mt-1">{promo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-white/70">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Jusqu&apos;au {new Date(promo.dateFin).toLocaleDateString("fr-FR")}
                      </span>
                      {joursRestants > 0 && (
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {joursRestants} jour{joursRestants > 1 ? "s" : ""} restant{joursRestants > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-[#1A1A2E] mb-4">
                      Biens concernés ({promo.biens.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {promo.biens.map((pb) => {
                        const bien = pb.bien
                        const prixPromo = bien.prix
                          ? bien.prix * (1 - promo.reduction / 100)
                          : null

                        return (
                          <Link
                            key={bien.id}
                            href={`/biens/${bien.slug}`}
                            className="group bg-[#F8F7F4] rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
                          >
                            <div className="relative h-40 overflow-hidden">
                              {bien.photos[0] ? (
                                <Image
                                  src={bien.photos[0]}
                                  alt={bien.titre}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                  sizes="(max-width: 640px) 100vw, 33vw"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <Home className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <div className="absolute top-2 left-2">
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  -{promo.reduction}%
                                </span>
                              </div>
                            </div>
                            <div className="p-3">
                              <h4 className="font-semibold text-sm text-[#1A1A2E] group-hover:text-primary transition-colors line-clamp-1">
                                {bien.titre}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <MapPin className="h-3 w-3" />
                                <span>{bien.ville || "Lomé"}{bien.quartier ? `, ${bien.quartier}` : ""}</span>
                                {bien.quartier && <span>, {bien.quartier}</span>}
                              </div>
                              <div className="mt-2">
                                {prixPromo && bien.prix ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#FF385C]">
                                      {formatPrix(prixPromo)}
                                    </span>
                                    <span className="text-[10px] text-gray-400 line-through">
                                      {formatPrix(bien.prix)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm font-medium text-gray-500">
                                    Prix sur demande
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                                {bien.superficie && (
                                  <span className="flex items-center gap-0.5">
                                    <Ruler className="h-3 w-3" /> {bien.superficie} m²
                                  </span>
                                )}
                                {bien.nbPieces && (
                                  <span className="flex items-center gap-0.5">
                                    <Building2 className="h-3 w-3" /> {bien.nbPieces} p.
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                    <div className="mt-4 text-right">
                      <Link
                        href={`/biens?promotionId=${promo.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-[#E02D4F] transition-colors"
                      >
                        Voir tous les biens <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
