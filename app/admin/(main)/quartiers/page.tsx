"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ImageUploader from "@/components/admin/ImageUploader"
import { Trash2, Plus, GripVertical, ImageIcon } from "lucide-react"

interface Quartier {
  id: string
  nom: string
  description: string | null
  image: string | null
  slug: string
  ordre: number
  published: boolean
}

export default function AdminQuartiersPage() {
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [loading, setLoading] = useState(true)
  const [nom, setNom] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function loadQuartiers() {
    try {
      const res = await fetch("/api/quartiers")
      const data = await res.json()
      setQuartiers(data)
    } catch {} finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadQuartiers() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (nom.trim().length < 2) { setError("Nom trop court"); return }
    try {
      const res = await fetch("/api/quartiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          description: description.trim(),
          image: image || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur")
      }
      setSuccess(`Quartier "${nom}" ajouté`)
      setNom(""); setDescription(""); setImage("")
      loadQuartiers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur")
    }
  }

  async function handleDelete(id: string, nom: string) {
    if (!confirm(`Supprimer le quartier "${nom}" ?`)) return
    try {
      await fetch(`/api/quartiers/${id}`, { method: "DELETE" })
      loadQuartiers()
    } catch {}
  }

  if (loading) return <div className="p-8 text-gray-500">Chargement...</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-[#1A1A1A]">Quartiers</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez les quartiers de Lomé</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Ajouter un quartier
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Input
                placeholder="Nom du quartier *"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                minLength={2}
              />
              <Input
                placeholder="Description (ex: Quartier résidentiel calme)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <ImageUploader
              currentImage={image || null}
              onUploaded={setImage}
              label="Photo du quartier"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {quartiers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun quartier pour le moment</p>
            <p className="text-xs mt-1">Ajoutez votre premier quartier ci-dessus</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {quartiers.map((q) => (
              <div key={q.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                  {q.image ? (
                    <img src={q.image} alt={q.nom} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1A1A1A]">{q.nom}</p>
                  {q.description && (
                    <p className="text-xs text-gray-500 truncate">{q.description}</p>
                  )}
                  <p className="text-[10px] text-gray-400 mt-0.5">/{q.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(q.id, q.nom)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
