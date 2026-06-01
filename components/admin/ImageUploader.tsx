"use client"

import { useState, useRef } from "react"
import { ImageIcon, Upload, X, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  currentImage?: string | null
  onUploaded: (url: string) => void
  label?: string
}

export default function ImageUploader({ currentImage, onUploaded, label = "Photo" }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo")
      return
    }

    setError("")
    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result as string
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64 }),
        })
        if (!res.ok) throw new Error("Erreur upload")
        const data = await res.json()
        setPreview(data.url)
        onUploaded(data.url)
        setUploading(false)
      }
      reader.onerror = () => {
        setError("Erreur de lecture du fichier")
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setError("Erreur lors de l'upload")
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    onUploaded("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#1A1A1A]">{label}</label>

      {preview ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200 group">
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-40 h-40 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#FF385C] hover:bg-[#FFF0F3] transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-[#FF385C] animate-spin" />
              <span className="text-xs text-gray-500">Upload...</span>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-xs text-gray-500">Cliquez pour choisir</span>
              <span className="text-[10px] text-gray-400">PNG, JPG max 5 Mo</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {currentImage && !preview && (
        <p className="text-xs text-gray-400">Image actuelle conservée</p>
      )}
    </div>
  )
}
