"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Eye, User, Phone, Clock, CheckCircle, XCircle, Search,
  Calendar, ChevronLeft, ChevronRight, CalendarDays, List,
  CreditCard, MessageCircle, Building2, Plus, Trash2, Loader2,
} from "lucide-react"

interface Agent { id: string; nom: string; telephone: string; actif: boolean }
interface BienMini { id: string; titre: string; slug: string; photos: string[] }

interface Visite {
  id: string; codeUnique: string; bienId: string
  bien: BienMini | null; agentId: string | null; agent: Agent | null
  nomClient: string; telClient: string; emailClient: string | null
  message: string | null; creneau: string; statut: string
  frais: number | null; modePaiement: string | null; statutPaiement: string
  note: number | null; commentaire: string | null; createdAt: string
}

const STATUTS = ["demandee", "confirmee", "agent_part", "arrive", "terminee", "annulee"] as const
const STATUT_LABELS: Record<string, string> = {
  demandee: "Demandée", confirmee: "Confirmée", agent_part: "En route",
  arrive: "Arrivé", terminee: "Terminée", annulee: "Annulée",
}
const STATUT_COLORS: Record<string, string> = {
  demandee: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-200",
  confirmee: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-200",
  agent_part: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-200",
  arrive: "bg-green-50 text-green-700 border-green-200 ring-green-200",
  terminee: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-200",
  annulee: "bg-red-50 text-red-700 border-red-200 ring-red-200",
}
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
const DAYS_SHORT = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"]
const HOURS_PRESETS = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"]

function formatCreneau(creneau: string): string {
  if (creneau.includes("-") && creneau.split("-").length >= 4) {
    const parts = creneau.split("-")
    const dateStr = parts.slice(0, 3).join("-")
    const timeStr = parts[3] || ""
    const d = new Date(dateStr + "T" + (timeStr.includes(":") ? timeStr : timeStr + ":00"))
    return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) + " à " + timeStr
  }
  return creneau
}

export default function AdminVisitesPage() {
  const [visites, setVisites] = useState<Visite[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar")
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [joursDispo, setJoursDispo] = useState<Record<string, number>>({})
  const [dateHeures, setDateHeures] = useState<string[]>([])
  const [editingHeures, setEditingHeures] = useState(false)
  const [editHeureInput, setEditHeureInput] = useState("")
  const [savingHeures, setSavingHeures] = useState(false)

  async function loadVisites() {
    try {
      const url = filter !== "all" ? `/api/visites?statut=${filter}` : "/api/visites"
      const res = await fetch(url)
      setVisites(await res.json())
    } catch {} finally { setLoading(false) }
  }

  async function loadAgents() {
    try { const res = await fetch("/api/agents"); setAgents(await res.json()) } catch {}
  }

  useEffect(() => { loadVisites(); loadAgents() }, [filter])

  useEffect(() => {
    const mois = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
    fetch(`/api/creneaux-disponibles?mois=${mois}`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, number> = {}
        if (data.joursDisponibles) {
          for (const j of data.joursDisponibles) {
            const day = parseInt(j.date.split("-")[2])
            map[day] = j.count
          }
        }
        setJoursDispo(map)
      })
      .catch(() => {})
  }, [currentMonth, currentYear])

  useEffect(() => {
    if (selectedDay) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
      fetch(`/api/creneaux-disponibles?date=${dateStr}`)
        .then((r) => r.json())
        .then((data) => {
          setDateHeures(data.creneaux || [])
        })
        .catch(() => setDateHeures([]))
    }
  }, [selectedDay, currentMonth, currentYear, visites])

  async function updateVisite(id: string, data: Record<string, unknown>) {
    try {
      await fetch(`/api/visites/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
      loadVisites()
    } catch {}
  }

  async function nextStatut(visite: Visite) {
    const idx = STATUTS.indexOf(visite.statut as typeof STATUTS[number])
    if (idx < STATUTS.length - 1) await updateVisite(visite.id, { statut: STATUTS[idx + 1] })
  }

  async function saveDateHeures(heures: string[]) {
    if (!selectedDay) return
    setSavingHeures(true)
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
    try {
      await fetch("/api/creneaux-exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, heures }),
      })
      setDateHeures(heures)
      setEditingHeures(false)
    } catch {} finally { setSavingHeures(false) }
  }

  function toggleHour(h: string) {
    setDateHeures((prev) =>
      prev.includes(h) ? prev.filter((x) => x !== h) : [...prev, h].sort()
    )
  }

  function addCustomHour() {
    if (!editHeureInput) return
    if (!dateHeures.includes(editHeureInput)) {
      setDateHeures((prev) => [...prev, editHeureInput].sort())
    }
    setEditHeureInput("")
  }

  const filtered = visites.filter((v) => {
    if (!search) return true
    const q = search.toLowerCase()
    return v.codeUnique.toLowerCase().includes(q) || v.nomClient.toLowerCase().includes(q) ||
      v.telClient.includes(q) || v.bien?.titre.toLowerCase().includes(q)
  })

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  function getDayVisites(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return filtered.filter((v) => v.creneau.startsWith(dateStr))
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-[#1A1A1A]">Visites terrain</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} visite{filtered.length > 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-lg transition-all ${viewMode === "calendar" ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"}`}>
            <CalendarDays className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-gray-500 hover:text-gray-700"}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["all", ...STATUTS].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${
                filter === s ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
              }`}>
              {s === "all" ? "Toutes" : STATUT_LABELS[s]}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64 sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 bg-white" />
        </div>
      </div>

      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <button onClick={() => { setCurrentMonth((m) => m === 0 ? 11 : m - 1); setCurrentYear((y) => currentMonth === 0 ? y - 1 : y); setSelectedDay(null) }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              <span className="font-semibold text-[#1A1A2E]">{MONTHS[currentMonth]} {currentYear}</span>
              <button onClick={() => { setCurrentMonth((m) => m === 11 ? 0 : m + 1); setCurrentYear((y) => currentMonth === 11 ? y + 1 : y); setSelectedDay(null) }}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-50">
              {DAYS_SHORT.map((d) => (
                <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-3">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day, i) => {
                if (!day) return <div key={i} className="min-h-[100px] border-b border-r border-gray-50" />
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const dayVisites = getDayVisites(day)
                const dispoCount = joursDispo[day] || 0
                const isToday = dateStr === todayStr
                const isSelected = selectedDay === day

                return (
                  <div key={i}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    className={`min-h-[110px] border-b border-r border-gray-50 p-1.5 cursor-pointer transition-all hover:bg-gray-50/50 ${
                      isSelected ? "ring-2 ring-primary ring-inset bg-primary/[0.02]" : ""
                    }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-all ${
                        isSelected ? "bg-primary text-white" : isToday ? "bg-primary/10 text-primary font-bold" : "text-gray-600"
                      }`}>{day}</span>
                      {dispoCount > 0 && (
                        <span className="text-[9px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">{dispoCount} créneaux</span>
                      )}
                    </div>
                    {dayVisites.slice(0, 2).map((v) => (
                      <div key={v.id} className="flex items-center gap-1 px-1 py-0.5 rounded mb-0.5 text-[10px]"
                        style={{ backgroundColor: STATUT_COLORS[v.statut]?.split(" ")[0] || "#f3f4f6" }}>
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${v.statutPaiement === "paye" ? "bg-green-500" : "bg-amber-400"}`} />
                        <span className="truncate font-medium text-gray-700">{v.nomClient.split(" ")[0]}</span>
                        {v.creneau.includes("-") && <span className="text-gray-400 ml-auto">{v.creneau.split("-")[3]}</span>}
                      </div>
                    ))}
                    {dayVisites.length > 2 && <p className="text-[9px] text-gray-400 text-center">+{dayVisites.length - 2}</p>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {selectedDay ? (() => {
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`
              const dayVisites = getDayVisites(selectedDay)
              return (
                <div>
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-[#1A1A2E]">
                        {selectedDay} {MONTHS[currentMonth]}
                      </h3>
                      <span className="text-xs text-gray-500">{dayVisites.length} visite{dayVisites.length > 1 ? "s" : ""}</span>
                    </div>
                    <p className="text-xs text-gray-400">{dateHeures.length} créneaux disponibles</p>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Créneaux du jour</Label>
                      <button onClick={() => setEditingHeures(!editingHeures)}
                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        {editingHeures ? "Fermer" : "Modifier"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {dateHeures.map((h) => (
                        <span key={h} className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          editingHeures ? "cursor-pointer hover:bg-red-50 hover:border-red-200 hover:text-red-600" : "bg-primary/5 text-primary border-primary/10"
                        }`}
                          onClick={() => editingHeures && toggleHour(h)}>
                          <Clock className="h-3 w-3" />
                          {h}
                          {editingHeures && <XCircle className="h-3 w-3 text-red-400" />}
                        </span>
                      ))}
                      {dateHeures.length === 0 && (
                        <p className="text-xs text-gray-400">Aucun créneau défini pour ce jour</p>
                      )}
                    </div>

                    {editingHeures && (
                      <div className="space-y-3 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Cliquez sur une heure pour l&apos;ajouter/retirer</p>
                        <div className="flex flex-wrap gap-1.5">
                          {HOURS_PRESETS.map((h) => (
                            <button key={h} onClick={() => toggleHour(h)}
                              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                                dateHeures.includes(h)
                                  ? "bg-primary text-white border-primary shadow-sm"
                                  : "bg-white text-gray-500 border-gray-200 hover:border-primary/40"
                              }`}>{h}</button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="text" value={editHeureInput} onChange={(e) => setEditHeureInput(e.target.value)}
                            placeholder="Heure perso (ex: 12:30)" className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            onKeyDown={(e) => { if (e.key === "Enter") addCustomHour() }} />
                          <button onClick={addCustomHour} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" onClick={() => saveDateHeures(dateHeures)} disabled={savingHeures} className="gap-1">
                            {savingHeures ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                            Enregistrer
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            fetch(`/api/creneaux-disponibles?date=${dateStr}`).then(r => r.json()).then(d => setDateHeures(d.creneaux || []))
                            setEditingHeures(false)
                          }}>Annuler</Button>
                        </div>
                      </div>
                    )}

                    {dayVisites.length > 0 && (
                      <div className="pt-3 border-t border-gray-100">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Visites du jour</Label>
                        <div className="space-y-1.5">
                          {dayVisites.sort((a, b) => a.creneau.localeCompare(b.creneau)).map((v) => (
                            <div key={v.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 text-xs">
                              <span className="font-mono font-bold text-primary w-14 text-center">{v.creneau.split("-")[3] || "--:--"}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{v.nomClient}</p>
                                <p className="text-gray-400 truncate">{v.bien?.titre}</p>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${v.statutPaiement === "paye" ? "bg-green-500" : "bg-amber-400"}`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })() : (
              <div className="p-8 text-center text-gray-400">
                <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Sélectionnez un jour</p>
                <p className="text-xs mt-1">pour gérer les créneaux</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 font-medium">Aucune visite trouvée</p>
            </div>
          ) : (
            filtered.map((visite) => {
              const isExpanded = expandedId === visite.id
              return (
                <div key={visite.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:shadow-sm">
                  <div onClick={() => setExpandedId(isExpanded ? null : visite.id)}
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
                    <div className={`w-1 h-10 rounded-full flex-shrink-0 ${visite.statutPaiement === "paye" ? "bg-green-400" : "bg-amber-400"}`} />
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      <div className="sm:col-span-2">
                        <p className="font-mono text-xs text-gray-400">{visite.codeUnique}</p>
                        <p className="font-semibold text-[#1A1A1A] truncate">{visite.nomClient}</p>
                        <p className="text-xs text-gray-500">{visite.telClient}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatCreneau(visite.creneau).split(" à ")[0]}</p>
                        <p className="text-xs font-medium text-gray-600 flex items-center gap-1"><Clock className="h-3 w-3" /> {formatCreneau(visite.creneau).split(" à ")[1] || visite.creneau}</p>
                      </div>
                      <div className="hidden sm:block">{visite.bien && <p className="text-xs text-gray-500 truncate">{visite.bien.titre}</p>}</div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border ${STATUT_COLORS[visite.statut] || ""}`}>
                          {STATUT_LABELS[visite.statut] || visite.statut}
                        </span>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${visite.statutPaiement === "paye" ? "bg-green-50" : "bg-amber-50"}`}>
                          <div className={`w-2 h-2 rounded-full ${visite.statutPaiement === "paye" ? "bg-green-500" : "bg-amber-500"}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/30 p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <Label className="text-[10px] text-gray-400 uppercase">Client</Label>
                          <p className="text-sm font-semibold mt-1">{visite.nomClient}</p>
                          <a href={`tel:${visite.telClient}`} className="text-sm text-primary">{visite.telClient}</a>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <Label className="text-[10px] text-gray-400 uppercase">Créneau</Label>
                          <p className="text-sm font-semibold mt-1">{formatCreneau(visite.creneau)}</p>
                          <p className="text-xs text-gray-400">Demandé le {new Date(visite.createdAt).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <Label className="text-[10px] text-gray-400 uppercase">Bien</Label>
                          {visite.bien && <p className="text-sm font-medium mt-1 truncate">{visite.bien.titre}</p>}
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <Label className="text-[10px] text-gray-400 uppercase">Agent</Label>
                          <select value={visite.agentId || ""} onChange={(e) => updateVisite(visite.id, { agentId: e.target.value || null })}
                            className="w-full mt-1 rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Non assigné</option>
                            {agents.filter((a) => a.actif).map((a) => (<option key={a.id} value={a.id}>{a.nom}</option>))}
                          </select>
                        </div>
                      </div>

                      {visite.message && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <Label className="text-[10px] text-gray-400 uppercase">Message</Label>
                          <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{visite.message}&rdquo;</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <Label className="text-[10px] text-gray-400 uppercase mb-3 block">Frais &amp; paiement</Label>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-500">Frais:</span>
                            <Input type="number" value={visite.frais || ""} onChange={(e) => updateVisite(visite.id, { frais: e.target.value })} className="w-28 text-sm" />
                          </div>
                          <div className="flex items-center gap-2">
                            <select value={visite.modePaiement || ""} onChange={(e) => updateVisite(visite.id, { modePaiement: e.target.value })}
                              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                              <option value="">Mode</option>
                              <option value="especes">Espèces</option>
                              <option value="flooz">Flooz</option>
                              <option value="tmoney">T-Money</option>
                              <option value="wave">Wave</option>
                            </select>
                            <button onClick={() => updateVisite(visite.id, { statutPaiement: visite.statutPaiement === "paye" ? "en_attente" : "paye" })}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                visite.statutPaiement === "paye" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                              <CreditCard className="h-3 w-3" /> {visite.statutPaiement === "paye" ? "Payé" : "En attente"}
                            </button>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <Label className="text-[10px] text-gray-400 uppercase mb-3 block">Actions</Label>
                          <div className="flex flex-wrap gap-2">
                            {visite.statut !== "terminee" && visite.statut !== "annulee" && (
                              <Button size="sm" onClick={() => nextStatut(visite)} className="gap-1.5">
                                <CheckCircle className="h-3.5 w-3.5" />
                                {visite.statut === "demandee" ? "Confirmer" : visite.statut === "confirmee" ? "En route" : visite.statut === "agent_part" ? "Arrivé" : "Terminer"}
                              </Button>
                            )}
                            {visite.statut !== "annulee" && visite.statut !== "terminee" && (
                              <Button size="sm" variant="outline" onClick={() => updateVisite(visite.id, { statut: "annulee" })}
                                className="gap-1.5 text-red-500 border-red-200 hover:bg-red-50">
                                <XCircle className="h-3.5 w-3.5" /> Annuler
                              </Button>
                            )}
                            <a href={`https://wa.me/228${visite.telClient.replace(/\s/g, "")}`} target="_blank"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all">
                              <MessageCircle className="h-3 w-3" /> WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>

                      {visite.statut === "terminee" && (
                        <div className="bg-white rounded-xl p-4 border border-gray-100">
                          <Label className="text-[10px] text-gray-400 uppercase mb-3 block">Évaluation</Label>
                          <div className="flex gap-1.5 mb-3">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button key={n} onClick={() => updateVisite(visite.id, { note: n })}
                                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${(visite.note || 0) >= n ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}>{n}</button>
                            ))}
                          </div>
                          <textarea placeholder="Commentaire..." defaultValue={visite.commentaire || ""}
                            onBlur={(e) => updateVisite(visite.id, { commentaire: e.target.value })}
                            rows={2} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
