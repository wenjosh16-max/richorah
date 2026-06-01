import { prisma } from "@/lib/prisma"
import { formatPrix } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { MapPin } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function QuartiersPage() {
  const biens = await prisma.bien.findMany({
    where: { published: true, statut: "actif" },
    select: {
      ville: true,
      quartier: true,
      prix: true,
      type: true,
      superficie: true,
    },
  })

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

  const quartiers = Array.from(quartierMap.entries())
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
            Découvrez les prix moyens par quartier à Lomé, Togo
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {quartiers.length === 0 ? (
          <div className="text-center py-16 text-[#717171]">
            Aucun quartier référencé pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {quartiers.map((q) => (
              <Link
                key={q.nom}
                href={`/biens?ville=${encodeURIComponent(q.nom)}`}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-[#222] group-hover:text-primary transition-colors">
                      {q.nom}
                    </h3>
                  </div>
                  <span className="text-[10px] font-medium text-[#717171] bg-gray-100 px-2 py-0.5 rounded-full">
                    {q.count} bien{q.count > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#717171]">Prix moyen</span>
                    <span className="font-bold text-[#222]">
                      {q.prixMoyen ? formatPrix(q.prixMoyen) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#717171]">
                    <span>Min</span>
                    <span>{q.prixMin ? formatPrix(q.prixMin) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#717171]">
                    <span>Max</span>
                    <span>{q.prixMax ? formatPrix(q.prixMax) : "—"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  {q.types.includes("vente") && (
                    <span className="text-[10px] font-medium text-primary bg-[#FFF0F3] px-2 py-0.5 rounded-full">
                      Vente
                    </span>
                  )}
                  {q.types.includes("location") && (
                    <span className="text-[10px] font-medium text-[#00875A] bg-[#E8F8F0] px-2 py-0.5 rounded-full">
                      Location
                    </span>
                  )}
                  <span className="ml-auto text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Voir les biens →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
