import { prisma } from "@/lib/prisma"
import { formatPrix, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Plus, Share2, Edit3, Search, ImageOff, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { changeStatut } from "./actions"
import DeleteBienButton from "@/components/admin/DeleteBienButton"

export const dynamic = "force-dynamic"

const STATUT_OPTIONS = ["actif", "vendu", "loué", "brouillon"]

const STATUT_BADGE: Record<string, string> = {
  actif: "default",
  vendu: "success",
  "loué": "info",
  brouillon: "secondary",
}

async function searchParamsHandler(searchParams: Promise<{ [key: string]: string | undefined }>) {
  const params = await searchParams
  return params
}

export default async function BiensPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const sp = await searchParamsHandler(searchParams)
  const filter = sp.filtre || "tous"
  const search = sp.recherche || ""

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const where: Record<string, unknown> = {}

  if (filter === "actifs") where.statut = "actif"
  else if (filter === "vendus") where.statut = "vendu"
  else if (filter === "loués") where.statut = "loué"
  else if (filter === "a-mettre-a-jour") where.updatedAt = { lt: thirtyDaysAgo }

  if (search) where.titre = { contains: search, mode: "insensitive" }

  const biens = await prisma.bien.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      promotions: {
        include: { promotion: true },
        where: { promotion: { active: true } },
      },
    },
  })

  const FILTERS = [
    { key: "tous", label: "Tous" },
    { key: "actifs", label: "Actifs" },
    { key: "vendus", label: "Vendus" },
    { key: "loués", label: "Loués" },
    { key: "a-mettre-a-jour", label: "À mettre à jour" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">
          {biens.length} bien{biens.length > 1 ? "s" : ""}
        </h2>
        <Link href="/admin/biens/nouveau">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un bien
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={`/admin/biens?filtre=${f.key}${search ? `&recherche=${search}` : ""}`}
            >
              <Button
                variant={filter === f.key ? "default" : "ghost"}
                size="sm"
              >
                {f.label}
              </Button>
            </Link>
          ))}
        </div>

        <form className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            name="recherche"
            defaultValue={search}
            placeholder="Rechercher par titre..."
            className="pl-9 pr-9"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-primary transition-colors rounded-md hover:bg-gray-100" aria-label="Rechercher">
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {biens.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            Aucun bien trouvé.
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="divide-y divide-gray-100 md:hidden">
              {biens.map((bien) => {
                const needsUpdate = new Date(bien.updatedAt) < thirtyDaysAgo
                return (
                  <div key={bien.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-20 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {bien.photos[0] ? (
                          <img src={bien.photos[0]} alt={bien.titre} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center"><ImageOff className="h-5 w-5 text-gray-300" /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-[#1A1A2E] text-sm leading-tight line-clamp-2">{bien.titre}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <a href={`/biens/${bien.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Voir sur le site"><Share2 className="h-3.5 w-3.5" /></a>
                            <Link href={`/admin/biens/${bien.id}/modifier`} className="p-1.5 text-gray-400 hover:text-primary transition-colors" title="Modifier"><Edit3 className="h-3.5 w-3.5" /></Link>
                            <DeleteBienButton bienId={bien.id} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-semibold text-[#1A1A2E]">{bien.prix ? formatPrix(bien.prix, bien.prixPeriode) : "—"}</span>
                          <span className="text-[10px] text-gray-400 capitalize">{bien.type}</span>
                          {bien.ville && <span className="text-[10px] text-gray-400">· {bien.ville}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <form action={changeStatut.bind(null, bien.id, cycleStatut(bien.statut))}>
                          <button type="submit" className="cursor-pointer">
                            <Badge variant={(STATUT_BADGE[bien.statut] || "secondary") as "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline"} className="text-[10px] px-2 py-0">{bien.statut}</Badge>
                          </button>
                        </form>
                        {needsUpdate && <span className="flex items-center gap-1 text-[10px] text-red-500"><AlertTriangle className="h-3 w-3" /> MAJ</span>}
                        {bien.promotions.length > 0 && <Badge variant="warning" className="text-[10px]">-{bien.promotions[0].promotion.reduction}%</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        {bien.vues > 0 && <span>{bien.vues} vues</span>}
                        <span>{formatDate(bien.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8F7F4] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 w-14"></th>
                    <th className="px-4 py-3">Titre</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Prix</th>
                    <th className="px-4 py-3">Ville</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Vues</th>
                    <th className="px-4 py-3">Dernière MAJ</th>
                    <th className="px-4 py-3 w-10"></th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {biens.map((bien) => {
                    const needsUpdate = new Date(bien.updatedAt) < thirtyDaysAgo
                    return (
                      <tr key={bien.id} className="hover:bg-[#F8F7F4] transition-colors">
                        <td className="px-4 py-3">
                          <div className="h-10 w-14 rounded-md bg-gray-100 overflow-hidden flex items-center justify-center">
                            {bien.photos[0] ? (
                              <img src={bien.photos[0]} alt={bien.titre} className="h-full w-full object-cover" />
                            ) : (
                              <ImageOff className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[#1A1A2E] truncate max-w-[200px] block">{bien.titre}</span>
                            {needsUpdate && <span title="Non mis à jour depuis 30+ jours"><AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" /></span>}
                            {bien.promotions.length > 0 && <Badge variant="warning" className="text-[10px]">-{bien.promotions[0].promotion.reduction}%</Badge>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{bien.type}</td>
                        <td className="px-4 py-3 font-medium text-[#1A1A2E]">{bien.prix ? formatPrix(bien.prix, bien.prixPeriode) : "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{bien.ville || "—"}</td>
                        <td className="px-4 py-3">
                          <form action={changeStatut.bind(null, bien.id, cycleStatut(bien.statut))}>
                            <button type="submit" className="cursor-pointer">
                              <Badge variant={(STATUT_BADGE[bien.statut] || "secondary") as "default" | "secondary" | "success" | "warning" | "danger" | "info" | "outline"} className="hover:opacity-80 transition-opacity">{bien.statut}</Badge>
                            </button>
                          </form>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{bien.vues}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {formatDate(bien.updatedAt)}
                          {needsUpdate && <span className="ml-1.5 inline-block h-2 w-2 rounded-full bg-red-500" />}
                        </td>
                        <td className="px-4 py-3">
                          <a href={`/biens/${bien.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex text-gray-400 hover:text-[#FF385C] transition-colors" title="Voir sur le site"><Share2 className="h-4 w-4" /></a>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Link href={`/admin/biens/${bien.id}/modifier`} className="p-1.5 text-gray-400 hover:text-[#FF385C] transition-colors rounded-md hover:bg-[#F8F7F4]" title="Modifier"><Edit3 className="h-4 w-4" /></Link>
                            <DeleteBienButton bienId={bien.id} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function cycleStatut(current: string): string {
  const idx = STATUT_OPTIONS.indexOf(current)
  return STATUT_OPTIONS[(idx + 1) % STATUT_OPTIONS.length]
}
