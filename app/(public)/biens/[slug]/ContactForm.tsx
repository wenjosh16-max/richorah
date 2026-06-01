"use client"

import { useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { envoyerMessage } from "./actions"

interface ContactFormProps {
  bienId: string
  bienTitre: string
}

export default function ContactForm({ bienId, bienTitre }: ContactFormProps) {
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const result = await envoyerMessage(formData)

    if (result.success) {
      toast({ title: "Message envoyé", description: result.message })
      formRef.current?.reset()
    } else {
      toast({
        title: "Erreur",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <input type="hidden" name="bienId" value={bienId} />
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
          Nom complet *
        </label>
        <input
          id="nom"
          name="nom"
          required
          minLength={2}
          placeholder="Votre nom"
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="telephone" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
          Téléphone *
        </label>
        <input
          id="telephone"
          name="telephone"
          type="tel"
          required
          minLength={6}
          placeholder="70 00 00 00"
          className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          minLength={10}
          defaultValue={`Bonjour, je suis intéressé par ${bienTitre}`}
          className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent resize-y min-h-[100px]"
        />
      </div>
      <Button type="submit" className="w-full gap-2">
        <Send className="h-4 w-4" />
        Envoyer le message
      </Button>
    </form>
  )
}
