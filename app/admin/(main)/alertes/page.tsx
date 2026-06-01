"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { Mail } from "lucide-react"

interface AlerteItem {
  id: string
  email: string
  type: string | null
  ville: string | null
  budgetMax: number | null
  superficieMin: number | null
  createdAt: string
}

export default function AlertesPage() {
  const { toast } = useToast()
  const [alertes, setAlertes] = useState<AlerteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)

  const fetchAlertes = useCallback(async () => {
    setLoading(true)
    try {
      const base = window.location.origin
      const res = await fetch(`${base}/api/alertes`)
      const data = await res.json()
      setAlertes(data)
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les alertes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchAlertes()
  }, [fetchAlertes])

  const handleSendEmail = async (alerte: AlerteItem) => {
    setSendingId(alerte.id)
    // Placeholder - just log it
    console.log("Envoi d'email à", alerte.email, "pour une alerte", alerte.type, "à", alerte.ville)
    await new Promise((r) => setTimeout(r, 500))
    toast({ title: "Email envoyé (simulation)", description: `Notification à ${alerte.email}` })
    setSendingId(null)
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">
          {alertes.length} alerte{alertes.length > 1 ? "s" : ""}
        </h2>
      </div>

      {alertes.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Aucune alerte souscrite.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F7F4] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Ville</th>
                  <th className="px-4 py-3">Budget max</th>
                  <th className="px-4 py-3">Superficie min</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {alertes.map((a) => (
                  <tr key={a.id} className="hover:bg-[#F8F7F4] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A1A2E]">{a.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={a.type === "vente" ? "default" : "info"}>
                        {a.type || "Tous"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.ville || "Toutes"}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.budgetMax ? `${a.budgetMax.toLocaleString("fr-FR")} FCFA` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {a.superficieMin ? `${a.superficieMin} m²` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {formatDate(a.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(a)}
                        disabled={sendingId === a.id}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {sendingId === a.id ? "..." : "Email"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
