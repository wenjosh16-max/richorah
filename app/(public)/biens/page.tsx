export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { formatPrix } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Prisma } from "@prisma/client"
import Link from "next/link"
import Image from "next/image"
import {
  Home,
  MapPin,
  Ruler,
  Building2,
  Map,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import FavoriteButton from "@/components/public/FavoriteButton"
import FilterLocationField from "@/components/public/FilterLocationField"

import { EQUIPEMENTS as EQUIPEMENTS_OPTIONS } from "@/lib/equipements"

const ITEMS_PER_PAGE = 10

interface BiensPageProps {
  searchParams: Promise<{
    type?: string
    ville?: string
    prixMin?: string
    prixMax?: string
    superficieMin?: string
    nbPieces?: string
    equipements?: string | string[]
    tri?: string
    page?: string
    affichage?: string
    promotionId?: string
  }>
}

export default async function BiensPage({ searchParams }: BiensPageProps) {
  const params = await searchParams

  const type = params.type
  const ville = params.ville
  const prixMin = params.prixMin ? Number(params.prixMin) : undefined
  const prixMax = params.prixMax ? Number(params.prixMax) : undefined
  const superficieMin = params.superficieMin ? Number(params.superficieMin) : undefined
  const nbPieces = params.nbPieces ? Number(params.nbPieces) : undefined
  const equipementsParam = params.equipements
  const equipements = equipementsParam
    ? Array.isArray(equipementsParam)
      ? equipementsParam
      : [equipementsParam]
    : undefined
  const tri = params.tri || "recent"
  const page = params.page ? Math.max(1, Number(params.page)) : 1
  const affichage = params.affichage || "grille"
  const promotionId = params.promotionId

  const where: Prisma.BienWhereInput = { statut: "actif" }

  if (type === "vente" || type === "location") {
    where.type = type
  }

  if (ville) {
    where.OR = [
      { ville: { contains: ville, mode: "insensitive" } },
      { quartier: { contains: ville, mode: "insensitive" } },
    ]
  }

  const prixFilter: Prisma.FloatNullableFilter = {}
  if (prixMin !== undefined) prixFilter.gte = prixMin
  if (prixMax !== undefined) prixFilter.lte = prixMax
  if (Object.keys(prixFilter).length > 0) {
    where.prix = prixFilter
  }

  if (superficieMin !== undefined) {
    where.superficie = { gte: superficieMin }
  }

  if (nbPieces !== undefined) {
    where.nbPieces = nbPieces
  }

  if (equipements && equipements.length > 0) {
    where.equipements = { hasSome: equipements }
  }

  if (promotionId) {
    where.promotions = {
      some: { promotionId },
    }
  }

  let orderBy: Prisma.BienOrderByWithRelationInput
  switch (tri) {
    case "prix_asc":
      orderBy = { prix: "asc" }
      break
    case "prix_desc":
      orderBy = { prix: "desc" }
      break
    default:
      orderBy = { createdAt: "desc" }
  }

  const promotionActive = promotionId
    ? await prisma.promotion.findUnique({ where: { id: promotionId } })
    : null

  const [total, biens] = await Promise.all([
    prisma.bien.count({ where }),
    prisma.bien.findMany({
      where,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        promotions: {
          include: { promotion: true },
          where: promotionId
            ? { promotionId }
            : {
                promotion: {
                  active: true,
                  dateDebut: { lte: new Date() },
                  dateFin: { gte: new Date() },
                },
              },
        },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))

  function buildUrl(updates: Record<string, string | undefined>): string {
    const sp = new URLSearchParams()

    if (params.type) sp.set("type", params.type)
    if (params.ville) sp.set("ville", params.ville)
    if (params.prixMin) sp.set("prixMin", params.prixMin)
    if (params.prixMax) sp.set("prixMax", params.prixMax)
    if (params.superficieMin) sp.set("superficieMin", params.superficieMin)
    if (params.nbPieces) sp.set("nbPieces", params.nbPieces)
    if (equipementsParam) {
      if (Array.isArray(equipementsParam)) {
        equipementsParam.forEach((e) => sp.append("equipements", e))
      } else {
        sp.set("equipements", equipementsParam)
      }
    }
    if (tri !== "recent") sp.set("tri", tri)
    if (page > 1) sp.set("page", String(page))
    if (affichage !== "grille") sp.set("affichage", affichage)
    if (promotionId) sp.set("promotionId", promotionId)

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        sp.delete(key)
      } else {
        sp.set(key, value)
      }
    }

    const qs = sp.toString()
    return `/biens${qs ? `?${qs}` : ""}`
  }

  const paginationPages: (number | "ellipsis")[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 2) {
      paginationPages.push(i)
    } else if (paginationPages[paginationPages.length - 1] !== "ellipsis") {
      paginationPages.push("ellipsis")
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <section className="relative py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80"
            alt="Nos biens immobiliers"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-xs tracking-widest uppercase font-medium mb-3">
                Catalogue
              </div>
              <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white">
                Nos biens
              </h1>
              <p className="text-white/60 mt-2">
                {total} bien{total !== 1 ? "s" : ""} trouvé{total !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={buildUrl({ affichage: "grille" })}
                className={`p-2.5 rounded-xl transition-all ${
                  affichage === "grille"
                    ? "bg-[#FF385C] text-white shadow-lg shadow-[#FF385C]/25"
                    : "bg-white/10 backdrop-blur-md text-white/70 hover:bg-white/20"
                }`}
                aria-label="Vue grille"
              >
                <Grid3X3 className="h-5 w-5" />
              </Link>
              <Link
                href={buildUrl({ affichage: "carte" })}
                className={`p-2.5 rounded-xl transition-all ${
                  affichage === "carte"
                    ? "bg-[#FF385C] text-white shadow-lg shadow-[#FF385C]/25"
                    : "bg-white/10 backdrop-blur-md text-white/70 hover:bg-white/20"
                }`}
                aria-label="Vue carte"
              >
                <Map className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 shrink-0">
            <form method="GET" action="/biens" className="bg-white rounded-xl p-6 shadow-sm space-y-5">
              <div>
                <label htmlFor="filter-type" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Type
                </label>
                <select
                  id="filter-type"
                  name="type"
                  defaultValue={type || ""}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                >
                  <option value="">Tous</option>
                  <option value="vente">Vente</option>
                  <option value="location">Location</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-ville" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Ville / Quartier
                </label>
                <FilterLocationField defaultValue={ville || ""} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="filter-prix-min" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                    Prix min
                  </label>
                  <input
                    id="filter-prix-min"
                    type="number"
                    name="prixMin"
                    defaultValue={params.prixMin || ""}
                    placeholder="0"
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                  />
                </div>
                <div>
                  <label htmlFor="filter-prix-max" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                    Prix max
                  </label>
                  <input
                    id="filter-prix-max"
                    type="number"
                    name="prixMax"
                    defaultValue={params.prixMax || ""}
                    placeholder="999 999 999"
                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="filter-superficie" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Superficie min (m&sup2;)
                </label>
                <input
                  id="filter-superficie"
                  type="number"
                  name="superficieMin"
                  defaultValue={params.superficieMin || ""}
                  placeholder="0"
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                />
              </div>

              <div>
                <label htmlFor="filter-pieces" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Pi&egrave;ces
                </label>
                <select
                  id="filter-pieces"
                  name="nbPieces"
                  defaultValue={params.nbPieces || ""}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                >
                  <option value="">Tous</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>
                      {n}+ pi&egrave;ces
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  &Eacute;quipements
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {EQUIPEMENTS_OPTIONS.map((eq) => (
                    <label key={eq} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="equipements"
                        value={eq}
                        defaultChecked={equipements?.includes(eq)}
                        className="rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
                      />
                      <span className="text-sm text-gray-700">{eq}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="filter-tri" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Trier par
                </label>
                <select
                  id="filter-tri"
                  name="tri"
                  defaultValue={tri}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                >
                  <option value="recent">Plus r&eacute;cents</option>
                  <option value="prix_asc">Prix croissant</option>
                  <option value="prix_desc">Prix d&eacute;croissant</option>
                </select>
              </div>

              <Button type="submit" className="w-full">
                Filtrer
              </Button>

              <Link
                href="/biens"
                className="block text-center text-sm text-[#FF385C] hover:underline"
              >
                R&eacute;initialiser les filtres
              </Link>
            </form>
          </aside>

          <div className="flex-1 min-w-0">
            {promotionActive && (
              <div className="bg-gradient-to-r from-primary to-[#E02D4F] rounded-xl p-4 sm:p-6 mb-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 bg-white/20 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Promotion
                  </span>
                  <span className="text-lg font-bold">-{promotionActive.reduction}%</span>
                </div>
                <h3 className="text-lg font-bold">{promotionActive.titre}</h3>
                {promotionActive.description && (
                  <p className="text-white/80 text-sm mt-0.5">{promotionActive.description}</p>
                )}
                <Link
                  href="/biens"
                  className="inline-block mt-2 text-xs text-white/70 hover:text-white underline"
                >
                  Voir tous les biens
                </Link>
              </div>
            )}
            {affichage === "carte" ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: "600px" }}>
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                  <div className="text-center">
                    <Map className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">Affichage carte</p>
                    <p className="text-sm">La carte interactive sera disponible prochainement.</p>
                  </div>
                </div>
              </div>
            ) : biens.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Home className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
                  Aucun bien trouv&eacute;
                </h3>
                <p className="text-gray-500 mb-6">
                  Essayez de modifier vos filtres pour voir plus de r&eacute;sultats.
                </p>
                <Link href="/biens">
                  <Button variant="outline">R&eacute;initialiser les filtres</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {biens.map((bien) => (
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
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
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
                          {(() => {
                            const promo = bien.promotions[0]?.promotion
                            if (!promo) return null
                            return (
                              <Badge className="bg-red-500 text-white border-0">
                                -{promo.reduction}%
                              </Badge>
                            )
                          })()}
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
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/biens/${bien.slug}`}
                            className="flex-1 min-w-0"
                          >
                            <h3 className="font-semibold text-[#1A1A2E] group-hover:text-[#FF385C] transition-colors line-clamp-1">
                              {bien.titre}
                            </h3>
                          </Link>
                          <FavoriteButton slug={bien.slug} />
                        </div>

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
                            (() => {
                              const promo = bien.promotions[0]?.promotion
                              if (promo) {
                                const prixPromo = bien.prix * (1 - promo.reduction / 100)
                                return (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xl font-bold text-[#FF385C]">
                                      {formatPrix(prixPromo)}
                                    </span>
                                    <span className="text-xs text-gray-400 line-through">
                                      {formatPrix(bien.prix)}
                                    </span>
                                    {bien.prixNegociable && (
                                      <span className="text-xs text-green-600">N&eacute;gociable</span>
                                    )}
                                  </div>
                                )
                              }
                              return (
                                <>
                                  <span className="text-xl font-bold text-[#FF385C]">
                                    {formatPrix(bien.prix)}
                                  </span>
                                  {bien.prixNegociable && (
                                    <span className="text-xs text-green-600 ml-2">N&eacute;gociable</span>
                                  )}
                                </>
                              )
                            })()
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    {page > 1 && (
                      <Link href={buildUrl({ page: String(page - 1) })}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <ChevronLeft className="h-4 w-4" /> Pr&eacute;c&eacute;dent
                        </Button>
                      </Link>
                    )}

                    <div className="flex gap-1">
                      {paginationPages.map((p) => {
                        if (p === "ellipsis") {
                          return (
                            <span key="ellipsis" className="px-2 py-1 text-gray-400 select-none">
                              ...
                            </span>
                          )
                        }
                        return (
                          <Link key={p} href={buildUrl({ page: String(p) })}>
                            <Button
                              variant={p === page ? "default" : "outline"}
                              size="sm"
                              className="min-w-[2.5rem]"
                            >
                              {p}
                            </Button>
                          </Link>
                        )
                      })}
                    </div>

                    {page < totalPages && (
                      <Link href={buildUrl({ page: String(page + 1) })}>
                        <Button variant="outline" size="sm" className="gap-1">
                          Suivant <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
