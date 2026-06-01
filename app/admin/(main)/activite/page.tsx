import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import { Activity, ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

const ITEMS_PER_PAGE = 20

async function searchParamsHandler(searchParams: Promise<{ [key: string]: string | undefined }>) {
  const params = await searchParams
  return params
}

export default async function ActivitePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const sp = await searchParamsHandler(searchParams)
  const page = parseInt(sp.page || "1")
  const skip = (page - 1) * ITEMS_PER_PAGE

  const [entries, total] = await Promise.all([
    prisma.journalActivite.findMany({
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip,
    }),
    prisma.journalActivite.count(),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#1A1A2E]">
        Journal d&apos;activité
      </h2>

      {entries.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          Aucune activité enregistrée.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 px-4 py-3 hover:bg-[#F8F7F4] transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-[#FF385C]/10 flex items-center justify-center flex-shrink-0">
                  <Activity className="h-4 w-4 text-[#FF385C]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#1A1A2E]">
                    {entry.action}
                  </p>
                  <p className="text-sm text-gray-500">{entry.description}</p>
                </div>
                <p className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {formatDate(entry.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/admin/activite?page=${page - 1}`}
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          >
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
          </Link>
          <span className="text-sm text-gray-500">
            Page {page} sur {totalPages}
          </span>
          <Link
            href={`/admin/activite?page=${page + 1}`}
            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
          >
            <Button variant="outline" size="sm">
              Suivant
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
