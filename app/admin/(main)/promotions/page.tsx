"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createPromotion, togglePromotion, deletePromotion } from "./actions"
import { formatDate } from "@/lib/utils"
import { Plus, Trash2, Power, PowerOff, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PromotionItem {
  id: string
  titre: string
  description: string | null
  reduction: number
  dateDebut: string
  dateFin: string
  active: boolean
  biens: { bienId: string; bien: { titre: string } }[]
}

interface BienOption {
  id: string
  titre: string
}

export default function PromotionsPage() {
  const { toast } = useToast()
  const [promotions, setPromotions] = useState<PromotionItem[]>([])
  const [biens, setBiens] = useState<BienOption[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    titre: "",
    description: "",
    reduction: "",
    dateDebut: "",
    dateFin: "",
    bienIds: [] as string[],
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const base = window.location.origin
      const [promosRes, biensRes] = await Promise.all([
        fetch(`${base}/api/promotions`),
        fetch(`${base}/api/biens`),
      ])
      const promos = await promosRes.json()
      const biensData = await biensRes.json()
      setPromotions(promos)
      setBiens(biensData)
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await togglePromotion(id, !current)
      setPromotions((prev) => prev.map((p) => (p.id === id ? { ...p, active: !current } : p)))
      toast({ title: current ? "Promotion désactivée" : "Promotion activée" })
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette promotion ?")) return
    try {
      await deletePromotion(id)
      setPromotions((prev) => prev.filter((p) => p.id !== id))
      toast({ title: "Promotion supprimée" })
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  const handleCreate = async () => {
    if (!form.titre || !form.reduction || !form.dateDebut || !form.dateFin) {
      toast({ title: "Erreur", description: "Tous les champs requis doivent être remplis", variant: "destructive" })
      return
    }
    try {
      await createPromotion({
        titre: form.titre,
        description: form.description,
        reduction: parseFloat(form.reduction),
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        bienIds: form.bienIds,
      })
      toast({ title: "Promotion créée !" })
      setForm({ titre: "", description: "", reduction: "", dateDebut: "", dateFin: "", bienIds: [] })
      setShowForm(false)
      fetchData()
    } catch {
      toast({ title: "Erreur", description: "Échec de la création", variant: "destructive" })
    }
  }

  const getStatus = (p: PromotionItem) => {
    const now = new Date()
    const debut = new Date(p.dateDebut)
    const fin = new Date(p.dateFin)
    if (!p.active) return { label: "Inactive", variant: "secondary" as const }
    if (now < debut) return { label: "À venir", variant: "warning" as const }
    if (now > fin) return { label: "Expirée", variant: "danger" as const }
    return { label: "Active", variant: "success" as const }
  }

  const daysRemaining = (dateFin: string) => {
    const diff = new Date(dateFin).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">
          {promotions.length} promotion{promotions.length > 1 ? "s" : ""}
        </h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle promotion
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
          >
            <h3 className="font-semibold text-[#1A1A2E]">Créer une promotion</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Titre *</Label>
                <Input value={form.titre} onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))} placeholder="Promo été 2026" />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <Label>Réduction (%) *</Label>
                <Input type="number" value={form.reduction} onChange={(e) => setForm((f) => ({ ...f, reduction: e.target.value }))} />
              </div>
              <div>
                <Label>Date de début *</Label>
                <Input type="date" value={form.dateDebut} onChange={(e) => setForm((f) => ({ ...f, dateDebut: e.target.value }))} />
              </div>
              <div>
                <Label>Date de fin *</Label>
                <Input type="date" value={form.dateFin} onChange={(e) => setForm((f) => ({ ...f, dateFin: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <Label>Biens concernés</Label>
                <div className="flex flex-wrap gap-2 mt-1 max-h-32 overflow-y-auto">
                  {biens.map((b) => {
                    const selected = form.bienIds.includes(b.id)
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            bienIds: selected ? f.bienIds.filter((id) => id !== b.id) : [...f.bienIds, b.id],
                          }))
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selected
                            ? "bg-[#FF385C] text-white border-[#FF385C]"
                            : "bg-white text-gray-600 border-gray-300"
                        }`}
                      >
                        {b.titre}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button onClick={handleCreate}>Créer la promotion</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {promotions.map((p) => {
          const status = getStatus(p)
          const remaining = daysRemaining(p.dateFin)
          return (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1A1A2E]">{p.titre}</span>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {status.label === "Active" && remaining > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Expire dans {remaining} jour{remaining > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                )}
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>-{p.reduction}%</span>
                  <span>{formatDate(p.dateDebut)} → {formatDate(p.dateFin)}</span>
                  <span>{p.biens.length} bien{p.biens.length > 1 ? "s" : ""}</span>
                </div>
                {p.biens.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {p.biens.map((pb) => (
                      <Badge key={pb.bienId} variant="secondary" className="text-[10px]">
                        {pb.bien.titre}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggle(p.id, p.active)}
                >
                  {p.active ? <PowerOff className="h-4 w-4 text-red-500" /> : <Power className="h-4 w-4 text-green-500" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
