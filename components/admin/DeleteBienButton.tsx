"use client"

import { Trash2 } from "lucide-react"
import { deleteBien } from "@/app/admin/(main)/biens/actions"

export default function DeleteBienButton({ bienId }: { bienId: string }) {
  return (
    <form action={deleteBien.bind(null, bienId)}>
      <button
        type="submit"
        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
        title="Supprimer"
        onClick={(e: React.MouseEvent) => {
          if (!confirm("Supprimer ce bien ?")) e.preventDefault()
        }}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  )
}
