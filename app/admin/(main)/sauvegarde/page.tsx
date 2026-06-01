"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Download, CheckCircle2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function SauvegardePage() {
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [lastExport, setLastExport] = useState<Date | null>(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch("/api/export")
      if (!res.ok) throw new Error("Export failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `richorah_export_${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setLastExport(new Date())
      toast({ title: "Export réussi !" })
    } catch {
      toast({ title: "Erreur", description: "Impossible d'exporter les données", variant: "destructive" })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-lg font-semibold text-[#1A1A2E]">Sauvegarde et export</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="text-center">
          <div className="h-16 w-16 rounded-full bg-[#FF385C]/10 flex items-center justify-center mx-auto mb-4">
            <Download className="h-8 w-8 text-[#FF385C]" />
          </div>
          <h3 className="font-semibold text-[#1A1A2E] mb-1">
            Exporter toutes les données
          </h3>
          <p className="text-sm text-gray-500">
            Téléchargez un fichier JSON contenant tous les biens, messages,
            promotions, alertes et contenus du site.
          </p>
        </div>

        {lastExport && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-4 py-3">
            <CheckCircle2 className="h-4 w-4" />
            Dernier export : {formatDate(lastExport)}
          </div>
        )}

        <Button
          onClick={handleExport}
          disabled={exporting}
          className="w-full"
          size="lg"
        >
          <Download className="h-5 w-5 mr-2" />
          {exporting ? "Export en cours..." : "Exporter JSON"}
        </Button>
      </div>
    </div>
  )
}
