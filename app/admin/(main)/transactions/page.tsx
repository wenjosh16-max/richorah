"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Plus, X, Check, Building2, User, Calendar, Trash2, Pencil } from "lucide-react"

interface Agent {
  id: string
  nom: string
  telephone: string
  actif: boolean
}

interface BienMini {
  id: string
  titre: string
  slug: string
  photos: string[]
  prix: number | null
}

interface Transaction {
  id: string
  bienId: string
  bien: BienMini | null
  agentId: string | null
  agent: Agent | null
  type: string
  montantTotal: number
  commissionTotal: number
  partAgence: number
  partAgent: number
  statut: string
  dateSignature: string | null
  dateEncaissement: string | null
  notes: string | null
  createdAt: string
}

const STATUTS = [
  { key: "negociation", label: "Négociation", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { key: "promesse", label: "Promesse", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "signe", label: "Signé", color: "bg-purple-50 border-purple-200 text-purple-700" },
  { key: "commission_attendue", label: "Commission attendue", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { key: "commission_payee", label: "Commission payée", color: "bg-green-50 border-green-200 text-green-700" },
]

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [biens, setBiens] = useState<BienMini[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    bienId: "",
    agentId: "",
    type: "vente",
    montantTotal: "",
    commissionTotal: "",
    partAgence: "",
    partAgent: "",
    statut: "negociation",
    dateSignature: "",
    dateEncaissement: "",
    notes: "",
  })

  async function loadData() {
    try {
      const [txRes, bienRes, agentRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/biens"),
        fetch("/api/agents"),
      ])
      setTransactions(await txRes.json())
      const biensData = await bienRes.json()
      if (Array.isArray(biensData)) setBiens(biensData)
      setAgents(await agentRes.json())
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function resetForm() {
    setForm({
      bienId: "", agentId: "", type: "vente", montantTotal: "",
      commissionTotal: "", partAgence: "", partAgent: "",
      statut: "negociation", dateSignature: "", dateEncaissement: "", notes: "",
    })
    setEditingId(null)
    setShowForm(false)
  }

  function editTransaction(tx: Transaction) {
    setForm({
      bienId: tx.bienId,
      agentId: tx.agentId || "",
      type: tx.type,
      montantTotal: tx.montantTotal.toString(),
      commissionTotal: tx.commissionTotal.toString(),
      partAgence: tx.partAgence.toString(),
      partAgent: tx.partAgent.toString(),
      statut: tx.statut,
      dateSignature: tx.dateSignature ? tx.dateSignature.split("T")[0] : "",
      dateEncaissement: tx.dateEncaissement ? tx.dateEncaissement.split("T")[0] : "",
      notes: tx.notes || "",
    })
    setEditingId(tx.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form }
    try {
      if (editingId) {
        await fetch(`/api/transactions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      } else {
        await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      }
      resetForm()
      loadData()
    } catch {}
  }

  async function updateStatut(id: string, statut: string) {
    try {
      await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      })
      loadData()
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette transaction ?")) return
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      loadData()
    } catch {}
  }

  function calculPartsAuto() {
    const total = parseFloat(form.montantTotal) || 0
    const commissionPct = 5 // from defaults
    const commission = total * (commissionPct / 100)
    const partAgence = commission * 0.5
    const partAgent = commission * 0.5
    setForm((f) => ({
      ...f,
      commissionTotal: Math.round(commission).toString(),
      partAgence: Math.round(partAgence).toString(),
      partAgent: Math.round(partAgent).toString(),
    }))
  }

  const grouped = STATUTS.map((s) => ({
    ...s,
    items: transactions.filter((t) => t.statut === s.key),
  }))

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Transactions</h1>
          <p className="text-gray-500 text-sm mt-1">Suivez les ventes, locations et commissions</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true) }} className="gap-2">
          <Plus className="h-4 w-4" /> Nouvelle transaction
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <h2 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
            {editingId ? <Pencil className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-primary" />}
            {editingId ? "Modifier la transaction" : "Nouvelle transaction"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Bien *</Label>
                <select
                  value={form.bienId}
                  onChange={(e) => setForm({ ...form, bienId: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                >
                  <option value="">Sélectionner un bien</option>
                  {biens.map((b) => (
                    <option key={b.id} value={b.id}>{b.titre}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Agent</Label>
                <select
                  value={form.agentId}
                  onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                >
                  <option value="">Non assigné</option>
                  {agents.filter((a) => a.actif).map((a) => (
                    <option key={a.id} value={a.id}>{a.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Type</Label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                >
                  <option value="vente">Vente</option>
                  <option value="location">Location</option>
                </select>
              </div>
              <div>
                <Label>Montant total (FCFA) *</Label>
                <Input
                  type="number"
                  required
                  value={form.montantTotal}
                  onChange={(e) => setForm({ ...form, montantTotal: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Commission totale (FCFA)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    value={form.commissionTotal}
                    onChange={(e) => setForm({ ...form, commissionTotal: e.target.value })}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={calculPartsAuto} className="shrink-0">
                    Auto
                  </Button>
                </div>
              </div>
              <div>
                <Label>Statut</Label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                >
                  {STATUTS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Part agence (FCFA)</Label>
                <Input
                  type="number"
                  value={form.partAgence}
                  onChange={(e) => setForm({ ...form, partAgence: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Part agent (FCFA)</Label>
                <Input
                  type="number"
                  value={form.partAgent}
                  onChange={(e) => setForm({ ...form, partAgent: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Date signature</Label>
                <Input
                  type="date"
                  value={form.dateSignature}
                  onChange={(e) => setForm({ ...form, dateSignature: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Date encaissement</Label>
                <Input
                  type="date"
                  value={form.dateEncaissement}
                  onChange={(e) => setForm({ ...form, dateEncaissement: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="gap-2">
                <Check className="h-4 w-4" />
                {editingId ? "Enregistrer" : "Créer"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm} className="gap-2">
                <X className="h-4 w-4" /> Annuler
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {grouped.map((col) => (
          <div key={col.key} className="space-y-3">
            <div className={`px-3 py-2 rounded-lg border text-sm font-semibold ${col.color}`}>
              {col.label}
              <span className="ml-2 opacity-60">{col.items.length}</span>
            </div>
            <div className="space-y-2">
              {col.items.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  Aucune
                </div>
              ) : (
                col.items.map((tx) => (
                  <div key={tx.id} className="bg-white rounded-xl border border-gray-100 p-3 space-y-2 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                          {tx.bien?.titre || "Bien supprimé"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.type === "vente" ? "Vente" : "Location"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-primary">
                        {tx.montantTotal.toLocaleString()} FCFA
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <DollarSign className="h-3 w-3" />
                        Commission: {tx.commissionTotal.toLocaleString()} FCFA
                      </div>
                    </div>

                    {tx.agent && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        {tx.agent.nom}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(tx.createdAt).toLocaleDateString("fr-FR")}
                    </div>

                    <div className="flex gap-1 pt-1">
                      {STATUTS.map((s) => {
                        const idx = STATUTS.findIndex((x) => x.key === tx.statut)
                        const sIdx = STATUTS.findIndex((x) => x.key === s.key)
                        if (sIdx <= idx) return null
                        return (
                          <button
                            key={s.key}
                            onClick={() => updateStatut(tx.id, s.key)}
                            className="flex-1 px-1.5 py-1 rounded text-[10px] font-medium bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"
                          >
                            {s.label.split(" ")[0]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
