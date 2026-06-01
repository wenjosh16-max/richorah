import { prisma } from "@/lib/prisma"
import { formatPrix } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Home, Building2, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

const FALLBACK_IMAGES: Record<string, string> = {
  "Tokoin": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "Adidogomé": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  "Kégué": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "Hédzranawoé": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"

export default async function QuartiersPage() {
  const [quartiers, biens] = await Promise.all([
    prisma.quartier.findMany({
      where: { published: true },
      orderBy: { ordre: "asc" },
    }),
    prisma.bien.findMany({
      where: { statut: "actif" },
      select: {
        ville: true,
        quartier: true,
        prix: true,
        type: true,
        superficie: true,
      },
    }),
  ])

  const quartierMap = new Map<string, { prix: number[]; count: number; types: Set<string> }>()

  for (const b of biens) {
    const key = b.quartier || b.ville || "Lomé"
    if (!quartierMap.has(key)) {
      quartierMap.set(key, { prix: [], count: 0, types: new Set() })
    }
    const entry = quartierMap.get(key)!
    if (b.prix) entry.prix.push(b.prix)
    entry.count++
    entry.types.add(b.type)
  }

  const statsFromBiens = Array.from(quartierMap.entries())
    .map(([nom, data]) => ({
      nom,
      count: data.count,
      types: Array.from(data.types),
      prixMoyen: data.prix.length > 0
        ? Math.round(data.prix.reduce((a, b) => a + b, 0) / data.prix.length)
        : null,
      prixMin: data.prix.length > 0 ? Math.min(...data.prix) : null,
      prixMax: data.prix.length > 0 ? Math.max(...data.prix) : null,
    }))
    .sort((a, b) => b.count - a.count)

  const allQuartierNames = new Set(quartiers.map((q) => q.nom))
  for (const s of statsFromBiens) {
    allQuartierNames.add(s.nom)
  }

  const displayQuartiers = Array.from(allQuartierNames).sort((a, b) => {
    const aFromDb = quartiers.find((q) => q.nom === a)
    const bFromDb = quartiers.find((q) => q.nom === b)
    if (aFromDb && bFromDb) return aFromDb.ordre - bFromDb.ordre
    if (aFromDb) return -1
    if (bFromDb) return 1
    return 0
  })

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <section className="relative py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1582407947304-fd86f028f8e1?w=1920&q=80"
            alt="Quartiers de Lomé"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-xs tracking-widest uppercase font-medium mb-4">
            Explorez
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">
            Quartiers de Lomé
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {displayQuartiers.length} quartiers référencés
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {displayQuartiers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Aucun quartier référencé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayQuartiers.map((nom) => {
              const qDb = quartiers.find((q) => q.nom === nom)
              const qStat = statsFromBiens.find((s) => s.nom === nom)
              const image = qDb?.image || FALLBACK_IMAGES[nom] || DEFAULT_IMAGE

              return (
                <Link
                  key={nom}
                  href={`/biens?ville=${encodeURIComponent(nom)}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#FF385C]/20 card-hover"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={image}
                      alt={nom}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[#FF385C]" />
                        <h3 className="font-serif text-xl font-bold text-white">{nom}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    {qDb?.description && (
                      <p className="text-gray-500 text-sm mb-3">{qDb.description}</p>
                    )}
                    {qStat ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Home className="h-4 w-4" />
                          <span>{qStat.count} bien{qStat.count > 1 ? "s" : ""}</span>
                          <span className="text-gray-300">·</span>
                          <span className="capitalize">{qStat.types.join(", ")}</span>
                        </div>
                        {qStat.prixMoyen && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">Prix moyen</span>
                            <span className="font-semibold text-[#1A1A1A]">{formatPrix(qStat.prixMoyen)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">Aucun bien référencé</p>
                    )}
                    <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Voir les biens <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
