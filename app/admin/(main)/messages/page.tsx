"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateMessageStatus, updateMessageNote } from "./actions"
import {
  Phone,
  MessageCircle,
  ExternalLink,
  Download,
  Search,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const STATUTS = ["nouveau", "contacté", "visité", "signé", "pas intéressé"]
const STATUT_COLORS: Record<string, "danger" | "warning" | "info" | "success" | "secondary"> = {
  nouveau: "danger",
  contacté: "warning",
  visité: "info",
  signé: "success",
  "pas intéressé": "secondary",
}

const FILTERS = [
  { key: "tous", label: "Tous" },
  { key: "nouveau", label: "Nouveaux" },
  { key: "en-cours", label: "En cours" },
  { key: "signé", label: "Signés" },
]

interface MessageItem {
  id: string
  nom: string
  telephone: string
  email: string | null
  message: string
  note: string | null
  bienId: string | null
  bien: { id: string; titre: string; slug: string } | null
  statut: string
  createdAt: string
}

export default function MessagesPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [filter, setFilter] = useState("tous")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<MessageItem | null>(null)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [changingId, setChangingId] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const baseUrl = window.location.origin
      const res = await fetch(`${baseUrl}/api/messages`)
      const data = await res.json()
      setMessages(data)
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les messages", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const handleStatusChange = async (id: string, newStatus: string) => {
    setChangingId(id)
    try {
      await updateMessageStatus(id, newStatus)
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, statut: newStatus } : m)))
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, statut: newStatus } : null)
      toast({ title: "Statut mis à jour" })
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setChangingId(null)
    }
  }

  const handleSaveNote = async (id: string) => {
    try {
      await updateMessageNote(id, note)
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, note } : m)))
      toast({ title: "Note enregistrée" })
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  const handleExportCSV = () => {
    const headers = ["Nom", "Téléphone", "Email", "Message", "Bien", "Statut", "Date"]
    const rows = messages.map((m) => [
      m.nom,
      m.telephone,
      m.email || "",
      m.message.replace(/"/g, '""'),
      m.bien?.titre || "",
      m.statut,
      m.createdAt,
    ])
    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `messages_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const filtered = messages.filter((m) => {
    if (filter === "nouveau") return m.statut === "nouveau"
    if (filter === "en-cours") return ["contacté", "visité"].includes(m.statut)
    if (filter === "signé") return m.statut === "signé"
    return true
  }).filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.nom.toLowerCase().includes(q) || m.telephone.includes(q) || m.message.toLowerCase().includes(q)
  })

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">
          {filtered.length} message{filtered.length > 1 ? "s" : ""}
        </h2>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-400">Aucun message trouvé.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filtered.map((msg) => {
              const isStale = msg.statut === "nouveau" && new Date(msg.createdAt) < fortyEightHoursAgo
              const isExpanded = selected?.id === msg.id
              return (
                <div key={msg.id}>
                  <div
                    onClick={() => {
                      if (isExpanded) {
                        setSelected(null)
                      } else {
                        setSelected(msg)
                        setNote(msg.note || "")
                      }
                    }}
                    className={`flex items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-[#F8F7F4] ${
                      isStale ? "bg-red-50 border-l-4 border-l-red-500" : ""
                    } ${isExpanded ? "bg-[#F8F7F4]" : ""}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1A1A2E] truncate">{msg.nom}</span>
                        {isStale && (
                          <span className="text-[10px] text-red-600 font-medium bg-red-100 px-1.5 py-0.5 rounded whitespace-nowrap">Sans réponse</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {msg.message.slice(0, 50)}{msg.message.length > 50 ? "..." : ""}
                      </p>
                    </div>
                    <div className="hidden sm:block text-sm text-gray-500 min-w-[120px]">
                      {msg.bien?.titre || "—"}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 sm:relative sm:flex-nowrap flex-wrap sm:flex-nowrap">
                      <div className="text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                      <Badge variant={STATUT_COLORS[msg.statut] || "secondary"}>
                        {msg.statut}
                      </Badge>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-[#F8F7F4] border-t border-gray-100"
                      >
                        <div className="p-4 space-y-4">
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <p className="text-sm text-[#1A1A2E] whitespace-pre-wrap">{msg.message}</p>
                            {msg.email && (
                              <p className="text-xs text-gray-500 mt-2">Email : {msg.email}</p>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`tel:${msg.telephone}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              {msg.telephone}
                            </a>
                            <a
                              href={`https://wa.me/${msg.telephone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Bonjour, je vous contacte suite à votre message sur Richorah Immobilier.")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#20BD5A] transition-colors"
                            >
                              <MessageCircle className="h-4 w-4" />
                              WhatsApp
                            </a>
                            {msg.bien && (
                              <a
                                href={`/biens/${msg.bien.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#2A2A4E] transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Voir le bien
                              </a>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {STATUTS.map((s) => (
                              <Button
                                key={s}
                                size="sm"
                                variant={msg.statut === s ? "default" : "outline"}
                                onClick={() => handleStatusChange(msg.id, s)}
                                disabled={changingId === msg.id}
                              >
                                {s}
                              </Button>
                            ))}
                          </div>

                          <div>
                            <Label>Note interne</Label>
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value)}
                              rows={3}
                              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] resize-y mt-1"
                              placeholder="Ajouter une note..."
                            />
                            <Button
                              size="sm"
                              className="mt-2"
                              onClick={() => handleSaveNote(msg.id)}
                            >
                              Enregistrer la note
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
