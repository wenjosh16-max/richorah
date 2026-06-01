"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { updateBien } from "./actions"
import { ArrowLeft, Save, ExternalLink, Upload, X, Check } from "lucide-react"
import Link from "next/link"

import { EQUIPEMENTS } from "@/lib/equipements"

interface BienData {
  id: string
  titre: string
  description: string | null
  type: string
  prix: number | null
  prixNegociable: boolean
  prixSurDemande: boolean
  ville: string | null
  quartier: string | null
  superficie: number | null
  nbPieces: number | null
  etage: number | null
  equipements: string[]
  latitude: number | null
  longitude: number | null
  statut: string
  photos: string[]
  slug: string
  urlVisite360: string | null
}

export default function ModifierBienPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [bien, setBien] = useState<BienData | null>(null)
  const [form, setForm] = useState({
    titre: "",
    description: "",
    type: "vente",
    prix: "",
    prixNegociable: false,
    prixSurDemande: false,
    ville: "",
    quartier: "",
    superficie: "",
    nbPieces: "",
    etage: "",
    equipements: [] as string[],
    latitude: "",
    longitude: "",
    statut: "actif",
    photos: [] as string[],
    slug: "",
    urlVisite360: "",
  })

  useEffect(() => {
    fetch(`/api/biens/${params.id}`)
      .then((r) => r.json())
      .then((data: BienData) => {
        setBien(data)
        setForm({
          titre: data.titre,
          description: data.description || "",
          type: data.type,
          prix: data.prix?.toString() || "",
          prixNegociable: data.prixNegociable,
          prixSurDemande: data.prixSurDemande,
          ville: data.ville || "",
          quartier: data.quartier || "",
          superficie: data.superficie?.toString() || "",
          nbPieces: data.nbPieces?.toString() || "",
          etage: data.etage?.toString() || "",
          equipements: data.equipements,
          latitude: data.latitude?.toString() || "",
          longitude: data.longitude?.toString() || "",
          statut: data.statut,
          photos: data.photos,
          slug: data.slug,
          urlVisite360: data.urlVisite360 || "",
        })
      })
  }, [params.id])

  const update = (field: string, value: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateBien(params.id as string, {
        titre: form.titre,
        description: form.description,
        type: form.type,
        prix: form.prix ? parseFloat(form.prix) : undefined,
        prixNegociable: form.prixNegociable,
        prixSurDemande: form.prixSurDemande,
        ville: form.ville,
        quartier: form.quartier,
        superficie: form.superficie ? parseFloat(form.superficie) : undefined,
        nbPieces: form.nbPieces ? parseInt(form.nbPieces) : undefined,
        etage: form.etage ? parseInt(form.etage) : undefined,
        equipements: form.equipements,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        statut: form.statut,
        photos: form.photos,
        slug: form.slug,
        urlVisite360: form.urlVisite360,
      })
      toast({ title: "Bien mis à jour !" })
    } catch {
      toast({ title: "Erreur", description: "Échec de la mise à jour", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: base64 }),
    })
    const data = await res.json()
    if (data.url) {
      update("photos", [...form.photos, data.url])
    }
  }

  const removePhoto = (index: number) => {
    update("photos", form.photos.filter((_, i) => i !== index))
  }

  if (!bien) {
    return <div className="p-12 text-center text-gray-400">Chargement...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Modifier le bien</h2>
          <p className="text-sm text-gray-500">{bien.titre}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/biens/${form.slug || bien.slug}`}
            target="_blank"
            className="text-sm text-[#FF385C] hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Prévisualiser
          </Link>
          <Link href="/admin/biens">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Titre</Label>
            <Input value={form.titre} onChange={(e) => update("titre", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={8}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] resize-y mt-1"
            />
          </div>
          <div>
            <Label>Type</Label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
            >
              <option value="vente">Vente</option>
              <option value="location">Location</option>
              <option value="terrain">Terrain</option>
            </select>
          </div>
          <div>
            <Label>Statut</Label>
            <select
              value={form.statut}
              onChange={(e) => update("statut", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
            >
              <option value="actif">Actif</option>
              <option value="brouillon">Brouillon</option>
              <option value="vendu">Vendu</option>
              <option value="loué">Loué</option>
            </select>
          </div>
          <div>
            <Label>Prix (FCFA)</Label>
            <Input type="number" value={form.prix} onChange={(e) => update("prix", e.target.value)} />
          </div>
          <div className="flex items-end gap-4 pb-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.prixNegociable}
                onChange={(e) => update("prixNegociable", e.target.checked)}
                className="rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
              />
              Prix négociable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.prixSurDemande}
                onChange={(e) => update("prixSurDemande", e.target.checked)}
                className="rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
              />
              Prix sur demande
            </label>
          </div>
          <div>
            <Label>Ville</Label>
            <Input value={form.ville} onChange={(e) => update("ville", e.target.value)} />
          </div>
          <div>
            <Label>Quartier</Label>
            <Input value={form.quartier} onChange={(e) => update("quartier", e.target.value)} />
          </div>
          <div>
            <Label>Superficie (m²)</Label>
            <Input type="number" value={form.superficie} onChange={(e) => update("superficie", e.target.value)} />
          </div>
          <div>
            <Label>Nombre de pièces</Label>
            <Input type="number" value={form.nbPieces} onChange={(e) => update("nbPieces", e.target.value)} />
          </div>
          <div>
            <Label>Étage</Label>
            <Input type="number" value={form.etage} onChange={(e) => update("etage", e.target.value)} />
          </div>
          <div>
            <Label>Latitude</Label>
            <Input type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} />
          </div>
          <div>
            <Label>Longitude</Label>
            <Input type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>URL Visite 360°</Label>
            <Input value={form.urlVisite360} onChange={(e) => update("urlVisite360", e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div>
          <Label>Équipements</Label>
          <div className="flex flex-wrap gap-2 mt-1">
            {EQUIPEMENTS.map((eq) => {
              const selected = form.equipements.includes(eq)
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() =>
                    update(
                      "equipements",
                      selected
                        ? form.equipements.filter((e) => e !== eq)
                        : [...form.equipements, eq]
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selected
                      ? "bg-[#FF385C] text-white border-[#FF385C]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#FF385C]"
                  }`}
                >
                  {selected && <Check className="h-3 w-3 inline mr-1" />}
                  {eq}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Label>Photos</Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
            {form.photos.map((url, i) => (
              <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF385C] transition-colors bg-gray-50">
              <Upload className="h-6 w-6 text-gray-400" />
              <span className="text-[10px] text-gray-400 mt-1">Ajouter</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.push("/admin/biens")}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  )
}
