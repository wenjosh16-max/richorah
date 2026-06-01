"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createBien } from "./actions"
import { Upload, ImagePlus, ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

import { EQUIPEMENTS } from "@/lib/equipements"

export default function NouveauBienPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)

  const [form, setForm] = useState({
    titre: "",
    type: "vente",
    prix: "",
    prixPeriode: "",
    prixTexte: "",
    ville: "",
    superficie: "",
    nbPieces: "",
    etage: "0",
    statut: "actif",
    description: "",
    quartier: "",
    equipements: [] as string[],
  })

  const update = (field: string, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFiles = async (files: File[]) => {
    const remaining = 10 - photos.length
    const toUpload = files.slice(0, remaining)
    if (toUpload.length === 0) return

    const uploaded: string[] = []
    for (const file of toUpload) {
      const base64 = await fileToBase64(file)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64 }),
      })
      const data = await res.json()
      if (data.url) uploaded.push(data.url)
    }
    setPhotos((prev) => [...prev, ...uploaded])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    )
    handleFiles(files)
  }

  const handlePublish = async () => {
    if (!form.titre) {
      toast({ title: "Erreur", description: "Le titre est requis", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await createBien({
        titre: form.titre,
        type: form.type,
        prix: form.prix ? parseFloat(form.prix) : undefined,
        prixPeriode: form.prixPeriode || undefined,
        prixTexte: form.prixTexte || undefined,
        ville: form.ville,
        quartier: form.quartier,
        superficie: form.superficie ? parseFloat(form.superficie) : undefined,
        nbPieces: form.nbPieces ? parseInt(form.nbPieces) : undefined,
        etage: form.etage ? parseInt(form.etage) : undefined,
        statut: form.statut,
        description: form.description,
        equipements: form.equipements,
        photos,
      })
      toast({ title: "Bien créé avec succès !" })
      router.push("/admin/biens")
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de la création", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: "Photos",
      content: (
        <div className="space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? "border-[#FF385C] bg-[#FF385C]/5" : "border-gray-300"
            }`}
          >
            <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-500 mb-2">
              Glissez-déposez vos photos ici
            </p>
            <p className="text-xs text-gray-400 mb-4">ou</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#F8F7F4] rounded-lg text-sm font-medium text-[#1A1A2E] hover:bg-gray-200 transition-colors">
              <ImagePlus className="h-4 w-4" />
              Choisir des fichiers
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
              />
            </label>
            <p className="text-xs text-gray-400 mt-3">
              {photos.length}/10 photos · JPG, PNG, WebP
            </p>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {photos.map((url, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setPhotos((p) => p.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Informations",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Titre *</Label>
            <Input value={form.titre} onChange={(e) => update("titre", e.target.value)} placeholder="Ex: Villa moderne à Lomé" />
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
            <Label>Prix (FCFA)</Label>
            <Input type="number" value={form.prix} onChange={(e) => update("prix", e.target.value)} placeholder="50 000 000" />
          </div>
          <div>
            <Label>Période du prix</Label>
            <select
              value={form.prixPeriode}
              onChange={(e) => update("prixPeriode", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
            >
              <option value="">Vente (forfait)</option>
              <option value="mois">Par mois</option>
              <option value="jour">Par jour</option>
              <option value="an">Par an</option>
              <option value="nuit">Par nuit</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label>Affichage personnalisé du prix (optionnel)</Label>
            <Input value={form.prixTexte} onChange={(e) => update("prixTexte", e.target.value)} placeholder="Ex: 50 000 FCFA/mois ou 1 000 000 FCFA/mois" />
          </div>
          <div>
            <Label>Ville</Label>
            <Input value={form.ville} onChange={(e) => update("ville", e.target.value)} placeholder="Lomé" />
          </div>
          <div>
            <Label>Quartier</Label>
            <Input value={form.quartier} onChange={(e) => update("quartier", e.target.value)} placeholder="Nyékonakpoé" />
          </div>
          <div>
            <Label>Superficie (m²)</Label>
            <Input type="number" value={form.superficie} onChange={(e) => update("superficie", e.target.value)} placeholder="250" />
          </div>
          <div>
            <Label>Nombre de pièces</Label>
            <Input type="number" value={form.nbPieces} onChange={(e) => update("nbPieces", e.target.value)} placeholder="4" />
          </div>
          <div>
            <Label>Étage</Label>
            <Input type="number" value={form.etage} onChange={(e) => update("etage", e.target.value)} placeholder="0" />
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
          <div className="sm:col-span-2">
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
        </div>
      ),
    },
    {
      title: "Publication",
      content: (
        <div className="space-y-4">
          <div>
            <Label>Description</Label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] resize-y mt-1"
              placeholder="Description du bien..."
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t">
            <Button onClick={handlePublish} disabled={loading || !form.titre} size="lg">
              {loading ? "Publication..." : "Publier"}
            </Button>
            <Link
              href="/admin/biens/nouveau?mode=complet"
              className="text-sm text-[#FF385C] hover:underline"
            >
              Mode complet →
            </Link>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#1A1A2E]">Nouveau bien</h2>
          <p className="text-sm text-gray-500">Mode rapide · {steps[step].title}</p>
        </div>
        <Link href="/admin/biens">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </Link>
      </div>

      <div className="flex gap-1">
        {steps.map((s, idx) => (
          <div
            key={idx}
            onClick={() => idx < step && setStep(idx)}
            className={`flex-1 h-2 rounded-full transition-colors cursor-pointer ${
              idx <= step ? "bg-[#FF385C]" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          {steps[step].content}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        {step < steps.length - 1 && (
          <Button onClick={() => setStep((s) => s + 1)}>
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
