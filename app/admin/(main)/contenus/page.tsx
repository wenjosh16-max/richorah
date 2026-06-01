"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImageUploader from "@/components/admin/ImageUploader"
import { useToast } from "@/components/ui/use-toast"
import { saveContenu } from "./actions"
import { Save, Upload } from "lucide-react"

const SECTIONS = [
  {
    title: "Logo",
    fields: [
      { key: "logo_url", label: "Logo de l'agence", type: "image" },
    ],
  },
  {
    title: "Notifications",
    fields: [
      { key: "admin_whatsapp", label: "Numéro WhatsApp pour les alertes (format: +22890123456)", type: "text" },
    ],
  },
  {
    title: "Hero",
    fields: [
      { key: "slogan_hero", label: "Slogan", type: "text" },
      { key: "sous_slogan_hero", label: "Sous-slogan", type: "text" },
    ],
  },
  {
    title: "Chiffres clés",
    fields: [
      { key: "chiffres_biens", label: "Nombre de biens", type: "text" },
      { key: "chiffres_clients", label: "Nombre de clients", type: "text" },
      { key: "chiffres_annees", label: "Années d'expérience", type: "text" },
      { key: "chiffres_quartiers", label: "Quartiers couverts", type: "text" },
    ],
  },
  {
    title: "Arguments",
    fields: [
      { key: "argument_1_titre", label: "Argument 1 - Titre", type: "text" },
      { key: "argument_1_texte", label: "Argument 1 - Texte", type: "textarea" },
      { key: "argument_2_titre", label: "Argument 2 - Titre", type: "text" },
      { key: "argument_2_texte", label: "Argument 2 - Texte", type: "textarea" },
      { key: "argument_3_titre", label: "Argument 3 - Titre", type: "text" },
      { key: "argument_3_texte", label: "Argument 3 - Texte", type: "textarea" },
      { key: "argument_4_titre", label: "Argument 4 - Titre", type: "text" },
      { key: "argument_4_texte", label: "Argument 4 - Texte", type: "textarea" },
    ],
  },
  {
    title: "À propos",
    fields: [
      { key: "a_propos_texte", label: "Texte", type: "textarea" },
      { key: "a_propos_photo", label: "Photo", type: "image" },
    ],
  },
]

export default function ContenusPage() {
  const { toast } = useToast()
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchContenus = useCallback(async () => {
    setLoading(true)
    try {
      const base = window.location.origin
      const res = await fetch(`${base}/api/contenus`)
      const data = await res.json()
      setValues(data)
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les contenus", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchContenus()
  }, [fetchContenus])

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveContenu(values)
      toast({ title: "Contenus enregistrés !" })
    } catch {
      toast({ title: "Erreur", description: "Échec de l'enregistrement", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-gray-400">Chargement...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1A1A2E]">Contenus du site</h2>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Enregistrement..." : "Tout enregistrer"}
        </Button>
      </div>

      {SECTIONS.map((section) => (
        <div
          key={section.title}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
        >
          <h3 className="font-semibold text-[#1A1A2E] border-b pb-2">{section.title}</h3>
          {section.fields.map((field) => (
            <div key={field.key}>
              {field.type === "image" ? (
                <ImageUploader
                  currentImage={values[field.key] || null}
                  onUploaded={(url) => updateValue(field.key, url)}
                  label={field.label}
                />
              ) : field.type === "textarea" ? (
                <div>
                  <Label>{field.label}</Label>
                  <textarea
                    value={values[field.key] || ""}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    rows={4}
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C] resize-y mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label>{field.label}</Label>
                  <Input
                    value={values[field.key] || ""}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Enregistrement..." : "Tout enregistrer"}
        </Button>
      </div>
    </div>
  )
}
