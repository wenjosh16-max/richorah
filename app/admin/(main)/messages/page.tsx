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
  Building2,
  Clock,
  Check,
  X,
  Copy,
  Send,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const STATUTS = ["nouveau", "lu", "contacté", "visité", "signé", "pas intéressé"]

const STATUT_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  nouveau: { label: "Nouveau", color: "bg-red-50 text-red-700 border-red-200", icon: Clock },
  lu: { label: "Lu", color: "bg-gray-50 text-gray-600 border-gray-200", icon: Check },
  "contacté": { label: "Contacté", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Phone },
  "visité": { label: "Visité", color: "bg-purple-50 text-purple-700 border-purple-200", icon: Building2 },
  "signé": { label: "Signé", color: "bg-green-50 text-green-700 border-green-200", icon: Check },
  "pas intéressé": { label: "Pas intéressé", color: "bg-gray-100 text-gray-500 border-gray-200", icon: X },
}

const FILTERS = [
  { key: "tous", label: "Tous" },
  { key: "nouveau", label: "Nouveaux" },
  { key: "en-cours", label: "En cours" },
  { key: "signé", label: "Signés" },
]

const REPONSE_TEMPLATES = [
  { label: "Accusé réception", message: "Bonjour, nous avons bien reçu votre message. Un conseiller vous contactera dans les plus brefs délais. Cordialement, Richorah Immobilier." },
  { label: "Proposition visite", message: "Bonjour, suite à votre demande, nous vous proposons une visite du bien. Merci de nous indiquer vos disponibilités. Cordialement, Richorah Immobilier." },
  { label: "Relance", message: "Bonjour, nous n'avons pas eu de retour de votre part. Souhaitez-vous toujours des informations sur ce bien ? Cordialement, Richorah Immobilier." },
]

interface MessageItem {
  id: string
  nom: string
  telephone: string
  email: string | null
  message: string
  note: string | null
  bienId: string | null
  bien: { id: string; titre: string; slug: string; photos: string[] } | null
  statut: string
  createdAt: string
}

interface BienOption {
  id: string
  titre: string
}

export default function MessagesPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [biens, setBiens] = useState<BienOption[]>([])
  const [filter, setFilter] = useState("tous")
  const [filterBien, setFilterBien] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<MessageItem | null>(null)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [changingId, setChangingId] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    fetch("/api/biens").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setBiens(data)
    }).catch(() => {})
  }, [])

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
      toast({ title: `Statut mis à jour : ${STATUT_CONFIG[newStatus]?.label || newStatus}` })
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
    const headers = ["Nom", "Téléphone", "Email", "Message", "Bien", "Statut", "Date", "Note"]
    const rows = messages.map((m) => [
      m.nom, m.telephone, m.email || "", m.message.replace(/"/g, '""'),
      m.bien?.titre || "", m.statut, m.createdAt, (m.note || "").replace(/"/g, '""'),
    ])
    const csv = [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `messages_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const copyTemplate = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Modèle copié", description: "Collez-le dans votre réponse WhatsApp" })
    setShowTemplates(false)
  }

  const filtered = messages.filter((m) => {
    if (filter === "nouveau") return m.statut === "nouveau"
    if (filter === "en-cours") return ["lu", "contacté", "visité"].includes(m.statut)
    if (filter === "signé") return m.statut === "signé"
    return true
  }).filter((m) => {
    if (filterBien && m.bienId !== filterBien) return false
    return true
  }).filter((m) => {
    if (!search) return true
    const q = search.toLowerCase()
    return m.nom.toLowerCase().includes(q) || m.telephone.includes(q) || m.message.toLowerCase().includes(q) || m.bien?.titre.toLowerCase().includes(q)
  })

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Messages</h1>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        {messages.filter((m) => m.statut === "nouveau").length} nouveau{messages.filter((m) => m.statut === "nouveau").length > 1 ? "x" : ""} message{messages.filter((m) => m.statut === "nouveau").length > 1 ? "s" : ""} en attente
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6">
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
        <select
          value={filterBien}
          onChange={(e) => setFilterBien(e.target.value)}
          className="w-full sm:w-48 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
        >
          <option value="">Tous les biens</option>
          {biens.map((b) => (
            <option key={b.id} value={b.id}>{b.titre}</option>
          ))}
        </select>
        <div className="relative w-full sm:w-64 sm:ml-auto">
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
                      if (isExpanded) { setSelected(null); return }
                      setSelected(msg)
                      setNote(msg.note || "")
                      if (msg.statut === "nouveau") handleStatusChange(msg.id, "lu")
                    }}
                    className={`flex items-start sm:items-center gap-3 sm:gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-[#F8F7F4] ${
                      isStale ? "bg-red-50/50" : ""
                    } ${isExpanded ? "bg-[#F8F7F4]" : ""}`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {msg.nom.charAt(0).toUpperCase()}
                      </div>
                      {msg.statut === "nouveau" && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#1A1A2E] truncate text-sm">{msg.nom}</span>
                        {isStale && (
                          <span className="text-[10px] text-red-600 font-medium bg-red-100 px-1.5 py-0.5 rounded whitespace-nowrap">Sans réponse</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span>{msg.telephone}</span>
                        {msg.bien && (
                          <>
                            <span>·</span>
                            <span className="truncate max-w-[150px]">{msg.bien.titre}</span>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{msg.message}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:block text-[10px] text-gray-400 text-right">
                        {new Date(msg.createdAt).toLocaleDateString("fr-FR")}
                        <br />
                        {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap ${STATUT_CONFIG[msg.statut]?.color || "bg-gray-50 text-gray-500"}`}>
                        {STATUT_CONFIG[msg.statut]?.label || msg.statut}
                      </span>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-gray-50 border-t border-gray-100"
                      >
                        <div className="p-4 sm:p-6 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200 sm:col-span-2">
                              <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Message</Label>
                              <p className="text-sm text-[#1A1A2E] whitespace-pre-wrap">{msg.message}</p>
                              {msg.email && (
                                <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                                  Email : <a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a>
                                </p>
                              )}
                            </div>
                            <div className="space-y-3">
                              {msg.bien && (
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                  <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Bien concerné</Label>
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                      {msg.bien.photos?.[0] ? (
                                        <img src={msg.bien.photos[0]} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Building2 className="h-5 w-5 text-gray-300" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium text-[#1A1A2E] truncate">{msg.bien.titre}</p>
                                      <a
                                        href={`/biens/${msg.bien.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                                      >
                                        <ExternalLink className="h-3 w-3" /> Voir
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Date</Label>
                                <p className="text-sm">
                                  {new Date(msg.createdAt).toLocaleDateString("fr-FR", {
                                    weekday: "long", day: "numeric", month: "long", year: "numeric",
                                  })}
                                </p>
                                <p className="text-xs text-gray-500">
                                  à {new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`tel:${msg.telephone}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#2A2A4E] transition-colors"
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
                              WhatsApp client
                            </a>
                            <div className="relative">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTemplates(!showTemplates)}
                                className="gap-1.5"
                              >
                                <Copy className="h-3.5 w-3.5" /> Modèles
                              </Button>
                              {showTemplates && (
                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl border border-gray-200 shadow-xl p-2 w-72 z-10">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 pb-1">Modèles de réponse</p>
                                  {REPONSE_TEMPLATES.map((t) => (
                                    <button
                                      key={t.label}
                                      onClick={() => copyTemplate(t.message)}
                                      className="w-full text-left p-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                                    >
                                      <p className="font-medium text-[#1A1A2E]">{t.label}</p>
                                      <p className="text-xs text-gray-500 line-clamp-1">{t.message}</p>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Statut</Label>
                            <div className="flex flex-wrap gap-1.5">
                              {STATUTS.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(msg.id, s)}
                                  disabled={changingId === msg.id}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                    msg.statut === s
                                      ? STATUT_CONFIG[s]?.color || "bg-primary text-white border-primary"
                                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  {STATUT_CONFIG[s]?.label || s}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-[10px] text-gray-400 uppercase tracking-wider mb-2 block">Note interne</Label>
                            <div className="flex gap-2">
                              <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={2}
                                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                placeholder="Ajouter une note interne..."
                              />
                              <Button size="sm" onClick={() => handleSaveNote(msg.id)} className="shrink-0 self-end">
                                <Send className="h-3.5 w-3.5 mr-1" /> Sauver
                              </Button>
                            </div>
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
