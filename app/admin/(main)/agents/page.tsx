"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Pencil, X, Check, User, Phone, Mail, MapPin } from "lucide-react"
import ImageUploader from "@/components/admin/ImageUploader"

interface Agent {
  id: string
  nom: string
  telephone: string
  email: string | null
  photo: string | null
  quartiers: string[]
  commissionPct: number | null
  actif: boolean
  ordre: number
  _count?: { visites: number; transactions: number }
}

const QUARTIERS_DISPONIBLES = [
  "Tokoin", "Kégué", "Adidogomé", "Bénin", "Nyékonakpoé",
  "Lomé 2", "Hédzranawoé", "Kodjoviakopé", "Doulassamé", "Agoè",
]

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    email: "",
    photo: "",
    quartiers: [] as string[],
    commissionPct: "",
    actif: true,
    ordre: 0,
  })

  async function loadAgents() {
    try {
      const res = await fetch("/api/agents")
      setAgents(await res.json())
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAgents() }, [])

  function resetForm() {
    setForm({ nom: "", telephone: "", email: "", photo: "", quartiers: [], commissionPct: "", actif: true, ordre: 0 })
    setEditingId(null)
  }

  function editAgent(a: Agent) {
    setForm({
      nom: a.nom,
      telephone: a.telephone,
      email: a.email || "",
      photo: a.photo || "",
      quartiers: a.quartiers,
      commissionPct: a.commissionPct?.toString() || "",
      actif: a.actif,
      ordre: a.ordre,
    })
    setEditingId(a.id)
  }

  function toggleQuartier(q: string) {
    setForm((f) => ({
      ...f,
      quartiers: f.quartiers.includes(q)
        ? f.quartiers.filter((x) => x !== q)
        : [...f.quartiers, q],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.nom.trim().length < 2 || form.telephone.trim().length < 3) return

    const body = {
      ...form,
      commissionPct: form.commissionPct || null,
      ordre: agents.length + 1,
    }

    try {
      if (editingId) {
        await fetch(`/api/agents/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }
      resetForm()
      loadAgents()
    } catch {}
  }

  async function handleDelete(id: string, nom: string) {
    if (!confirm(`Supprimer l'agent "${nom}" ?`)) return
    try {
      await fetch(`/api/agents/${id}`, { method: "DELETE" })
      loadAgents()
    } catch {}
  }

  async function toggleActif(agent: Agent) {
    try {
      await fetch(`/api/agents/${agent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...agent, actif: !agent.actif }),
      })
      loadAgents()
    } catch {}
  }

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Agents</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les agents immobiliers Richorah</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
          {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
          {editingId ? "Modifier l'agent" : "Ajouter un agent"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input placeholder="Nom complet *" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required minLength={2} />
              <Input placeholder="Téléphone *" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} required />
              <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input placeholder="% commission perso (laisser vide = défaut)" type="number" value={form.commissionPct} onChange={(e) => setForm({ ...form, commissionPct: e.target.value })} />
            </div>
            <ImageUploader currentImage={form.photo || null} onUploaded={(url) => setForm({ ...form, photo: url })} label="Photo de l'agent" />
          </div>

          <div>
            <Label>Quartiers couverts</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {QUARTIERS_DISPONIBLES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => toggleQuartier(q)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.quartiers.includes(q)
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="gap-2">
              {editingId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Enregistrer" : "Ajouter"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm} className="gap-2">
                <X className="h-4 w-4" /> Annuler
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {agents.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun agent pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                  {agent.photo ? (
                    <img src={agent.photo} alt={agent.nom} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#1A1A1A]">{agent.nom}</p>
                    <span
                      onClick={() => toggleActif(agent)}
                      className={`cursor-pointer inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        agent.actif ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {agent.actif ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{agent.telephone}</span>
                    {agent.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{agent.email}</span>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin className="h-3 w-3" />
                    {agent.quartiers.join(", ") || "Tous quartiers"}
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                    <span>{agent._count?.visites || 0} visites</span>
                    <span>{agent._count?.transactions || 0} transactions</span>
                    {agent.commissionPct && <span>{agent.commissionPct}% commission</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => editAgent(agent)}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all"
                    title="Modifier"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agent.id, agent.nom)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
