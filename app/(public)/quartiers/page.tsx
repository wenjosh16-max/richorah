import { prisma } from "@/lib/prisma"
import { formatPrix } from "@/lib/utils"
import Link from "next/link"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#222]">
            Quartiers de Lomé
          </h1>
          <p className="text-sm text-[#717171] mt-1">
            Découvrez les prix moyens par quartier à Lomé, Togo
          </p>
        </div>

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
