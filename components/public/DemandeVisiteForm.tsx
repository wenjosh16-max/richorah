"use client"

import { useState, useEffect } from "react"
import { Eye, Clock, ChevronRight, CheckCircle, Loader2, ChevronLeft, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DemandeVisiteFormProps { bienId: string; bienTitre: string }

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
const DAYS_SHORT = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"]

function classNames(...classes: (string | boolean | undefined)[]) { return classes.filter(Boolean).join(" ") }

export default function DemandeVisiteForm({ bienId }: DemandeVisiteFormProps) {
  const [step, setStep] = useState<"form" | "confirm">("form")
  const [loading, setLoading] = useState(false)
  const [frais, setFrais] = useState(5000)
  const [code, setCode] = useState("")
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedHeure, setSelectedHeure] = useState("")
  const [disponibles, setDisponibles] = useState<string[]>([])
  const [loadingCreneaux, setLoadingCreneaux] = useState(false)
  const [joursDispo, setJoursDispo] = useState<Record<string, number>>({})
  const today = new Date()

  const [formData, setFormData] = useState({ nomClient: "", telClient: "", emailClient: "", message: "" })

  useEffect(() => {
    fetch("/api/parametres").then((r) => r.json()).then((data) => {
      if (data.frais_visite_defaut) setFrais(Number(data.frais_visite_defaut))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const mois = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
    fetch(`/api/creneaux-disponibles?mois=${mois}&bienId=${bienId}`)
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, number> = {}
        if (data.joursDisponibles) {
          for (const j of data.joursDisponibles) map[j.date] = j.count
        }
        setJoursDispo(map)
      })
      .catch(() => {})
  }, [currentMonth, currentYear, bienId])

  async function loadCreneaux(dateStr: string) {
    setLoadingCreneaux(true)
    setSelectedHeure("")
    setDisponibles([])
    try {
      const res = await fetch(`/api/creneaux-disponibles?date=${dateStr}&bienId=${bienId}`)
      const data = await res.json()
      setDisponibles(data.creneaux || [])
      if (data.creneaux?.length > 0) setSelectedHeure(data.creneaux[0])
    } catch { setDisponibles([]) }
    finally { setLoadingCreneaux(false) }
  }

  function selectDate(day: number) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(dateStr)
    loadCreneaux(dateStr)
  }

  function isDateAvailable(day: number): boolean {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return !!joursDispo[dateStr]
  }

  function isPast(day: number): boolean {
    const d = new Date(currentYear, currentMonth, day)
    d.setHours(0, 0, 0, 0)
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return d < t
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
    setSelectedDate(null); setDisponibles([])
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
    setSelectedDate(null); setDisponibles([])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedDate || !selectedHeure) { alert("Choisissez une date et un créneau"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/visites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bienId, ...formData, creneau: `${selectedDate}-${selectedHeure}`, frais }),
      })
      const data = await res.json()
      setCode(data.codeUnique)
      setStep("confirm")
    } catch { alert("Erreur lors de la demande") }
    finally { setLoading(false) }
  }

  if (step === "confirm") {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="font-semibold text-[#1A1A2E] text-lg">Demande envoyée !</h3>
        <p className="text-sm text-gray-500 mt-1">Votre code de visite :</p>
        <div className="mt-3 inline-block bg-gray-50 rounded-xl px-6 py-3 border border-gray-200">
          <span className="text-2xl font-bold text-primary tracking-widest">{code}</span>
        </div>
        <p className="text-xs text-gray-400 mt-3">Un agent vous contactera sur <strong>{formData.telClient}</strong> pour confirmer.</p>
        <Button variant="outline" className="mt-4 gap-2" onClick={() => window.location.reload()}>
          <Eye className="h-4 w-4" /> Voir d&apos;autres biens
        </Button>
      </div>
    )
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A1A2E] text-lg">Visite terrain</h3>
            <p className="text-xs text-gray-500">Choisissez un jour disponible</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-800 font-medium">Frais de déplacement</span>
            <span className="text-lg font-bold text-amber-900">{frais.toLocaleString()} FCFA</span>
          </div>
          <p className="text-xs text-amber-600 mt-0.5">Paiement sur place après confirmation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="text-sm font-semibold text-[#1A1A2E] mb-3 flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-primary" /> Choisissez une date
            </Label>

            <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                  <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                <span className="text-sm font-semibold text-[#1A1A2E]">{MONTHS[currentMonth]} {currentYear}</span>
                <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={i} />
                  const isAvail = isDateAvailable(day)
                  const past = isPast(day)
                  const sel = selectedDate === `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  return (
                    <button key={i} type="button" disabled={!isAvail || past} onClick={() => selectDate(day)}
                      className={classNames(
                        "w-full aspect-square rounded-xl text-sm font-medium transition-all relative",
                        sel ? "bg-primary text-white shadow-sm ring-2 ring-primary/20" :
                        !isAvail || past ? "text-gray-300 cursor-not-allowed" :
                        "text-gray-700 hover:bg-primary/5 hover:shadow-sm hover:text-primary",
                      )}>
                      {day}
                      {isAvail && !past && !sel && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-400" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" /> Jour disponible
              </div>
            )}
          </div>

          {selectedDate && (
            <div>
              <Label className="text-sm font-semibold text-[#1A1A2E] mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> Créneaux disponibles
              </Label>
              {loadingCreneaux ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-3"><Loader2 className="h-4 w-4 animate-spin" /> Chargement...</div>
              ) : disponibles.length === 0 ? (
                <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">Aucun créneau disponible pour cette date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {disponibles.map((h) => (
                    <button key={h} type="button" onClick={() => setSelectedHeure(h)}
                      className={classNames(
                        "flex items-center justify-center gap-1.5 p-3 rounded-xl border text-sm transition-all",
                        selectedHeure === h
                          ? "border-primary bg-primary/5 text-primary font-semibold ring-1 ring-primary/20"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      )}>
                      <Clock className="h-3.5 w-3.5" /> {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-gray-100 pt-5 space-y-4">
            <div>
              <Label>Nom complet *</Label>
              <Input required minLength={2} value={formData.nomClient} onChange={(e) => setFormData({ ...formData, nomClient: e.target.value })} placeholder="Votre nom" className="mt-1" />
            </div>
            <div>
              <Label>Téléphone *</Label>
              <Input required type="tel" minLength={8} value={formData.telClient} onChange={(e) => setFormData({ ...formData, telClient: e.target.value })} placeholder="70 00 00 00" className="mt-1" />
            </div>
            <div>
              <Label>Email (optionnel)</Label>
              <Input type="email" value={formData.emailClient} onChange={(e) => setFormData({ ...formData, emailClient: e.target.value })} placeholder="email@exemple.com" className="mt-1" />
            </div>
            <div>
              <Label>Message (optionnel)</Label>
              <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Ex: Je confirme le créneau choisi" rows={2}
                className="flex w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mt-1" />
            </div>
            <Button type="submit" disabled={loading || !selectedHeure} className="w-full gap-2 h-12 text-base">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              {loading ? "Envoi..." : "Réserver la visite"}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Une question ? Appelez-nous au <strong className="text-gray-600">70 62 86 96</strong></p>
      </div>
    </div>
  )
}
