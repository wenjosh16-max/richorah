import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { MapPin, ArrowRight } from "lucide-react"

const FALLBACK_IMAGES: Record<string, string> = {
  "Tokoin": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80",
  "Adidogomé": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80",
  "Kégué": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "Hédzranawoé": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"

export default async function NeighborhoodsSection() {
  const quartiers = await prisma.quartier.findMany({
    where: { published: true },
    orderBy: { ordre: "asc" },
    take: 4,
  })

  return (
    <section className="py-16 lg:py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[#FF385C] text-xs tracking-[0.2em] uppercase font-medium">
              Quartiers
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1A1A] mt-1 leading-tight">
              Explorez Lomé par quartier
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Des quartiers variés pour tous les goûts et tous les budgets
            </p>
          </div>
          <Link
            href="/quartiers"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[#FF385C] hover:text-[#E02D4F] transition-colors group"
          >
            Tous les quartiers
            <span className="w-6 h-6 rounded-full border border-[#FF385C] flex items-center justify-center group-hover:bg-[#FF385C] group-hover:text-white transition-all">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quartiers.length > 0 ? (
            quartiers.map((q) => (
              <Link
                key={q.id}
                href={`/biens?ville=${encodeURIComponent(q.nom)}`}
                className="group relative h-80 rounded-2xl overflow-hidden"
              >
                <Image
                  src={q.image || FALLBACK_IMAGES[q.nom] || DEFAULT_IMAGE}
                  alt={q.nom}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-[#FF385C]" />
                    <h3 className="font-serif text-xl font-bold text-white">{q.nom}</h3>
                  </div>
                  {q.description && (
                    <p className="text-white/70 text-sm">{q.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-white/50 text-xs group-hover:translate-x-1 transition-transform">
                      Voir les biens →
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <>
              {[["Tokoin", "Quartier résidentiel prisé, calme et arboré", "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80"],
                ["Adidogomé", "Zone en plein essor, idéale pour investir", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80"],
                ["Kégué", "Quartier dynamique avec toutes les commodités", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"],
                ["Hédzranawoé", "Quartier chic en bord de mer", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80"],
              ].map(([nom, desc, img]) => (
                <Link
                  key={nom}
                  href={`/biens?ville=${nom}`}
                  className="group relative h-80 rounded-2xl overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={nom}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-[#FF385C]" />
                      <h3 className="font-serif text-xl font-bold text-white">{nom}</h3>
                    </div>
                    <p className="text-white/70 text-sm">{desc}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-white/50 text-xs group-hover:translate-x-1 transition-transform">
                        Voir les biens →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/quartiers">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#FF385C]">
              Tous les quartiers <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
