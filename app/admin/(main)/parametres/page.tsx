"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { saveParametres } from "./actions"
import { Save, Settings2, Clock, Plus, X, ChevronDown, ChevronUp } from "lucide-react"

interface ParamField {
  key: string
  label: string
  type: string
  suffix?: string
  hint?: string
}

const SECTIONS: { title: string; fields: ParamField[] }[] = [
  {
    title: "Commissions",
    fields: [
      { key: "commission_vente_pct", label: "Commission vente (%)", type: "number", suffix: "%" },
      { key: "commission_location_mois", label: "Commission location (mois de loyer)", type: "number", suffix: "mois" },
      { key: "commission_part_agence", label: "Part agence (%)", type: "number", suffix: "%" },
      { key: "commission_part_agent", label: "Part agent (%)", type: "number", suffix: "%" },
    ],
  },
  {
    title: "Coordonnées",
    fields: [
      { key: "telephone_standard", label: "Téléphone standard", type: "text" },
      { key: "telephone_standard_2", label: "Téléphone secondaire", type: "text" },
      { key: "telephone_whatsapp", label: "WhatsApp (228XXXXXXXX)", type: "text" },
      { key: "email_notification", label: "Email de notification", type: "text" },
    ],
  },
]

const DAYS_FR = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
const HOURS_PRESETS = [
  "8:00", "9:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
]

export default function ParametresPage() {
  const { toast } = useToast()
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState<Record<string, string[]>>({})
  const [scheduleOpen, setScheduleOpen] = useState(true)

  const fetchParams = useCallback(async () => {
    setLoading(true)
    try {
      const base = window.location.origin
      const res = await fetch(`${base}/api/parametres`)
      const data = await res.json()
      setValues(data)

      if (data.visite_creneaux) {
        try {
          const parsed = JSON.parse(data.visite_creneaux)
          setSchedule(parsed)
        } catch {
          const heures = data.visite_creneaux.split(",").map((s: string) => s.trim()).filter(Boolean)
          setSchedule(Object.fromEntries(DAYS_FR.map((d) => [d, [...heures]])))
        }
      } else {
        setSchedule(Object.fromEntries(DAYS_FR.map((d) => [d, []])))
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les paramètres", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchParams() }, [fetchParams])

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function toggleDayHour(day: string, hour: string) {
    setSchedule((prev) => {
      const current = prev[day] || []
      const next = current.includes(hour) ? current.filter((h) => h !== hour) : [...current, hour].sort()
      return { ...prev, [day]: next }
    })
  }

  function addCustomHour(day: string, hour: string) {
    if (!hour) return
    setSchedule((prev) => {
      const current = prev[day] || []
      if (current.includes(hour)) return prev
      return { ...prev, [day]: [...current, hour].sort() }
    })
  }

  function removeHour(day: string, hour: string) {
    setSchedule((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((h) => h !== hour),
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const allKeys = SECTIONS.flatMap((s) => s.fields.map((f) => f.key))
      const data: { cle: string; valeur: string; type: string }[] = allKeys.map((key) => ({
        cle: key,
        valeur: values[key] || "",
        type: "nombre",
      }))

      data.push({
        cle: "visite_creneaux",
        valeur: JSON.stringify(schedule),
        type: "string",
      })

      data.push({
        cle: "frais_visite_defaut",
        valeur: values.frais_visite_defaut || "5000",
        type: "nombre",
      })

      data.push({
        cle: "frais_visite_circuit",
        valeur: values.frais_visite_circuit || "15000",
        type: "nombre",
      })

      await saveParametres(data)
      toast({ title: "Paramètres enregistrés !" })
    } catch {
      toast({ title: "Erreur", description: "Échec de l'enregistrement", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Chargement...</div>
  }

  function dayLabel(day: string) {
    const labels: Record<string, string> = { lundi: "Lun", mardi: "Mar", mercredi: "Mer", jeudi: "Jeu", vendredi: "Ven", samedi: "Sam", dimanche: "Dim" }
    return labels[day] || day
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Paramètres</h2>
          <p className="text-sm text-gray-500 mt-0.5">Commissions, planning visites et coordonnées</p>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => setScheduleOpen(!scheduleOpen)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[#1A1A2E]">Planning des visites</h3>
              <p className="text-xs text-gray-500">Définissez les créneaux disponibles par jour de la semaine</p>
            </div>
          </div>
          {scheduleOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </button>

        {scheduleOpen && (
          <div className="px-5 pb-5 space-y-4">
            {DAYS_FR.map((day) => {
              const dayHours = schedule[day] || []
              const isWeekend = day === "samedi" || day === "dimanche"
              return (
                <div key={day} className={classNames("rounded-xl border p-4 transition-colors", isWeekend ? "border-gray-100 bg-gray-50/30" : "border-gray-100")}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold capitalize text-[#1A1A2E]">
                      {day}
                      <span className="text-xs text-gray-400 ml-2 font-normal">{dayHours.length} créneau{x(dayHours.length)}</span>
                    </span>
                    <span className={classNames(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      isWeekend ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"
                    )}>
                      {isWeekend ? "Week-end" : "Semaine"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {HOURS_PRESETS.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => toggleDayHour(day, h)}
                        className={classNames(
                          "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          dayHours.includes(h)
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white text-gray-500 border-gray-200 hover:border-primary/40 hover:text-primary"
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>

                  <CustomHourInput day={day} onAdd={addCustomHour} />

                  {dayHours.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                      {dayHours.filter((h) => !HOURS_PRESETS.includes(h)).map((h) => (
                        <span key={h} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-primary/5 text-primary border border-primary/10">
                          {h}
                          <button type="button" onClick={() => removeHour(day, h)} className="hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-[#1A1A2E] flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" /> Frais de visite
          </h3>
          <div>
            <Label>Frais de visite par défaut (FCFA)</Label>
            <Input value={values.frais_visite_defaut || "5000"} onChange={(e) => updateValue("frais_visite_defaut", e.target.value)} type="number" className="mt-1" />
          </div>
          <div>
            <Label>Frais circuit de visites (FCFA)</Label>
            <Input value={values.frais_visite_circuit || "15000"} onChange={(e) => updateValue("frais_visite_circuit", e.target.value)} type="number" className="mt-1" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="font-semibold text-[#1A1A2E] flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" /> Commissions
          </h3>
          {SECTIONS[0].fields.map((field) => (
            <div key={field.key}>
              <Label>{field.label}</Label>
              <div className="relative mt-1">
                <Input value={values[field.key] || ""} onChange={(e) => updateValue(field.key, e.target.value)}
                  type="number" className={field.suffix ? "pr-12" : ""} />
                {field.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{field.suffix}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-[#1A1A2E] flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" /> Coordonnées
        </h3>
        {SECTIONS[1].fields.map((field) => (
          <div key={field.key}>
            <Label>{field.label}</Label>
            <Input value={values[field.key] || ""} onChange={(e) => updateValue(field.key, e.target.value)} type="text" className="mt-1" />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement..." : "Tout enregistrer"}
        </Button>
      </div>
    </div>
  )
}

function CustomHourInput({ day, onAdd }: { day: string; onAdd: (day: string, hour: string) => void }) {
  const [value, setValue] = useState("")
  return (
    <div className="flex items-center gap-2 mt-1">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Heure perso (ex: 12:30)"
        className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="button"
        onClick={() => { if (value) { onAdd(day, value); setValue("") } }}
        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function x(n: number) {
  return n > 1 ? "x" : ""
}
