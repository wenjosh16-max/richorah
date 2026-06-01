"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createTemoignage, updateTemoignage, deleteTemoignage, toggleTemoignage } from "./actions"
import { Plus, Trash2, Star, Save, X, Eye, EyeOff, ArrowUp, ArrowDown, GripVertical } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TemoignageItem {
  id: string
  nom: string
  texte: string
  etoiles: number
  ordre: number
  actif: boolean
}

export default function TemoignagesPage() {
  const { toast } = useToast()
  const [temoignages, setTemoignages] = useState<TemoignageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    nom: "",
    texte: "",
    etoiles: 5,
    ordre: 0,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/temoignages")
      if (!res.ok) throw new Error("Erreur")
      const data = await res.json()
      if (Array.isArray(data)) {
        setTemoignages(data)
      }
    } catch {
      setTemoignages([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const resetForm = () => {
    setForm({ nom: "", texte: "", etoiles: 5, ordre: 0 })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (t: TemoignageItem) => {
    setForm({ nom: t.nom, texte: t.texte, etoiles: t.etoiles, ordre: t.ordre })
    setEditingId(t.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.nom || !form.texte) {
      toast({ title: "Erreur", description: "Le nom et le texte sont requis", variant: "destructive" })
      return
    }
    try {
      if (editingId) {
        await updateTemoignage(editingId, form)
        toast({ title: "Témoignage mis à jour" })
      } else {
        await createTemoignage(form)
        toast({ title: "Témoignage créé" })
      }
      resetForm()
      fetchData()
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return
    try {
      await deleteTemoignage(id)
      setTemoignages((prev) => prev.filter((t) => t.id !== id))
      toast({ title: "Témoignage supprimé" })
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleTemoignage(id, !current)
      setTemoignages((prev) => prev.map((t) => (t.id === id ? { ...t, actif: !current } : t)))
      toast({ title: current ? "Témoignage masqué" : "Témoignage affiché" })
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Chargement...</div>
  }

  const sorted = [...temoignages].sort((a, b) => a.ordre - b.ordre)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">
          {temoignages.length} témoignage{temoignages.length > 1 ? "s" : ""}
        </h2>
        <Button onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
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
            <h3 className="font-semibold text-[#1A1A2E]">
              {editingId ? "Modifier le témoignage" : "Nouveau témoignage"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Nom *</Label>
                <Input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} placeholder="Kodjo A." />
              </div>
              <div>
                <Label>Texte *</Label>
                <textarea
                  value={form.texte}
                  onChange={(e) => setForm((f) => ({ ...f, texte: e.target.value }))}
                  rows={4}
                  className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] resize-y mt-1"
                  placeholder="Excellent service..."
                />
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <Label>Étoiles</Label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => setForm((f) => ({ ...f, etoiles: n }))}>
                        <Star className={`h-6 w-6 ${n <= form.etoiles ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Ordre</Label>
                  <Input
                    type="number"
                    value={form.ordre}
                    onChange={(e) => setForm((f) => ({ ...f, ordre: parseInt(e.target.value) || 0 }))}
                    className="w-20 mt-1"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={resetForm}>Annuler</Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? "Mettre à jour" : "Créer"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {sorted.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1A1A2E]">{t.nom}</span>
                <Badge variant={t.actif ? "success" : "secondary"}>
                  {t.actif ? "Affiché" : "Masqué"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 italic line-clamp-2">
                &ldquo;{t.texte}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t.etoiles }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs text-gray-400">Ordre : {t.ordre}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => handleToggle(t.id, t.actif)}>
                {t.actif ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-green-500" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(t)}>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
        {temoignages.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            Aucun témoignage pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}
