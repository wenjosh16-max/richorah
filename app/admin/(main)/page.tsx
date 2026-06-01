import { prisma } from "@/lib/prisma"
import { formatDate, formatPrix } from "@/lib/utils"
import Link from "next/link"
import {
  Building2,
  Phone,
  MessageCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    biensActifs,
    biensVendusLoues,
    messagesNonLus,
    alertesCount,
    biensARenover,
    messagesRecents,
    biensData,
  ] = await Promise.all([
    prisma.bien.count({ where: { statut: "actif", published: true } }),
    prisma.bien.count({
      where: { statut: { in: ["vendu", "loué"] } },
    }),
    prisma.message.count({ where: { statut: "nouveau" } }),
    prisma.alerteBien.count(),
    prisma.bien.findMany({
      where: {
        updatedAt: { lt: thirtyDaysAgo },
        published: true,
        statut: "actif",
      },
      orderBy: { updatedAt: "asc" },
      take: 5,
      select: { id: true, titre: true, slug: true, updatedAt: true },
    }),
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        nom: true,
        telephone: true,
        message: true,
        statut: true,
        createdAt: true,
        bienId: true,
      },
    }),
    prisma.bien.findMany({
      where: { published: true },
      select: {
        id: true,
        titre: true,
        prix: true,
        type: true,
        statut: true,
        createdAt: true,
        superficie: true,
      },
    }),
  ])

  const biensRecents = await prisma.bien.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      titre: true,
      slug: true,
      prix: true,
      vues: true,
      statut: true,
      photos: true,
      type: true,
    },
  })

  const portfolioValue = biensData
    .filter((b) => b.statut === "actif" && b.prix)
    .reduce((sum, b) => sum + (b.prix ?? 0), 0)

  const avgPrice = biensActifs > 0 ? Math.round(portfolioValue / biensActifs) : 0

  const venteCount = biensData.filter((b) => b.type === "vente" && b.statut === "actif").length
  const locationCount = biensData.filter((b) => b.type === "location" && b.statut === "actif").length

  const typeLabels = [
    { label: "Vente", value: venteCount, color: "#FF385C" },
    { label: "Location", value: locationCount, color: "#00875A" },
  ]

  const maxType = Math.max(...typeLabels.map((t) => t.value), 1)

  const stalenessCount = biensARenover.length

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  function timeAgo(date: Date): string {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "à l'instant"
    if (mins < 60) return `il y a ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `il y a ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `il y a ${days}j`
    return formatDate(date)
  }

  return (
    <div className="space-y-6">
      {stalenessCount > 0 && (
        <div className="bg-[#FFF0F3] border border-primary/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#222]">
              {stalenessCount} bien{stalenessCount > 1 ? "s" : ""} à mettre à jour
            </p>
            <p className="text-xs text-[#717171] mt-0.5">
              Ces biens n&apos;ont pas été mis à jour depuis plus de 30 jours.
            </p>
          </div>
          <Link
            href="/admin/biens?filtre=a-mettre-a-jour"
            className="text-xs font-medium text-primary hover:text-[#E02D4F] transition-colors flex-shrink-0 mt-0.5"
          >
            Mettre à jour &rarr;
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Biens actifs"
          value={biensActifs}
          highlight
        />
        <MetricCard
          label="Vendus / Loués"
          value={biensVendusLoues}
        />
        <MetricCard
          label="Messages non lus"
          value={messagesNonLus}
          highlight
        />
        <MetricCard
          label="Alertes inscrites"
          value={alertesCount}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-[#222]">Aperçu financier</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-[#FAFAFA] rounded-lg p-3">
              <p className="text-[10px] text-[#717171] font-medium uppercase tracking-wider">Portefeuille</p>
              <p className="text-lg font-bold text-[#222] mt-1">{formatPrix(portfolioValue)}</p>
              <p className="text-[10px] text-[#717171]">{biensActifs} biens actifs</p>
            </div>
            <div className="bg-[#FAFAFA] rounded-lg p-3">
              <p className="text-[10px] text-[#717171] font-medium uppercase tracking-wider">Prix moyen</p>
              <p className="text-lg font-bold text-[#222] mt-1">{formatPrix(avgPrice)}</p>
              <p className="text-[10px] text-[#717171]">par bien</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-[#717171] uppercase tracking-wider">Répartition par type</p>
            {typeLabels.map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <span className="text-xs text-[#717171] w-16 flex-shrink-0">{t.label}</span>
                <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(t.value / maxType) * 100}%`,
                      backgroundColor: t.color,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-[#222] w-8 text-right">{t.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-[#222]">Performance des biens</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
              <div className="text-2xl font-bold text-primary">{biensVendusLoues}</div>
              <p className="text-[10px] text-[#717171] mt-0.5">Transactions</p>
            </div>
            <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
              <div className="text-2xl font-bold text-[#222]">
                {biensActifs > 0
                  ? Math.round((biensVendusLoues / (biensActifs + biensVendusLoues)) * 100)
                  : 0}%
              </div>
              <p className="text-[10px] text-[#717171] mt-0.5">Taux de conversion</p>
            </div>
            <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
              <div className="text-2xl font-bold text-[#222]">{messagesNonLus}</div>
              <p className="text-[10px] text-[#717171] mt-0.5">Leads non traités</p>
            </div>
            <div className="text-center p-4 bg-[#FAFAFA] rounded-lg">
              <div className="text-2xl font-bold text-[#00875A]">{alertesCount}</div>
              <p className="text-[10px] text-[#717171] mt-0.5">Alertes actives</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#222]">Biens récents</h3>
            <Link
              href="/admin/biens"
              className="text-xs font-medium text-primary hover:text-[#E02D4F] transition-colors"
            >
              Voir tout &rarr;
            </Link>
          </div>
          {biensRecents.length === 0 ? (
            <p className="text-sm text-[#717171]">Aucun bien récent.</p>
          ) : (
            <div className="space-y-3">
              {biensRecents.map((bien) => (
                <div
                  key={bien.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {bien.photos[0] ? (
                      <img
                        src={bien.photos[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#222] truncate">
                      {bien.titre}
                    </p>
                    <p className="text-xs text-[#717171]">
                      {bien.prix ? formatPrix(bien.prix) : "Prix sur demande"} · {bien.vues} vues
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#E8F8F0] text-[#00875A]">
                      {bien.type === "vente" ? "Vente" : "Location"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-[#717171]">
                      {bien.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#222]">Messages récents</h3>
            <Link
              href="/admin/messages"
              className="text-xs font-medium text-primary hover:text-[#E02D4F] transition-colors"
            >
              Voir tout &rarr;
            </Link>
          </div>
          {messagesRecents.length === 0 ? (
            <p className="text-sm text-[#717171]">Aucun message récent.</p>
          ) : (
            <div className="space-y-3">
              {messagesRecents.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {getInitials(msg.nom)}
                    </div>
                    {msg.statut === "nouveau" && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#222] truncate">
                        {msg.nom}
                      </p>
                      <span className="text-[10px] text-[#717171] flex-shrink-0">
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#717171] line-clamp-1 mt-0.5">
                      {msg.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <a
                        href={`tel:${msg.telephone}`}
                        className="text-[10px] font-medium text-primary hover:text-[#E02D4F] transition-colors"
                      >
                        {msg.telephone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                    <a
                      href={`https://wa.me/${msg.telephone?.replace(/\s/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 rounded-full bg-green-50 hover:bg-green-100 flex items-center justify-center text-green-600 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={`tel:${msg.telephone}`}
                      className="w-7 h-7 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-[#717171] transition-colors"
                      title="Appeler"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 transition-shadow hover:shadow-sm">
      <p className="text-2xl font-bold" style={{ color: highlight ? "#FF385C" : "#222" }}>
        {value.toLocaleString("fr-FR")}
      </p>
      <p className="text-sm text-[#717171] mt-1">{label}</p>
    </div>
  )
}
