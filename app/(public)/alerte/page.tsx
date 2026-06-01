"use client"

import { useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bell, Mail, MapPin, Building2, Ruler, DollarSign } from "lucide-react"
import { creerAlerte } from "./actions"

export default function AlertePage() {
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const result = await creerAlerte(formData)

    if (result.success) {
      toast({ title: "Alerte créée", description: result.message })
      formRef.current?.reset()
    } else {
      toast({ title: "Erreur", description: result.message })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-[#FF385C]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bell className="h-8 w-8 text-[#FF385C]" />
            </div>
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-[#1A1A2E] mb-3">
              Cr&eacute;er une alerte
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Recevez une notification par email d&egrave;s qu&apos;un bien
              correspondant &agrave; vos crit&egrave;res est publi&eacute;.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
            <form ref={formRef} action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#1A1A2E]">
                  <Mail className="h-4 w-4 inline mr-1.5 text-[#FF385C]" />
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-[#1A1A2E]">
                  <Building2 className="h-4 w-4 inline mr-1.5 text-[#FF385C]" />
                  Type de bien
                </Label>
                <select
                  id="type"
                  name="type"
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                >
                  <option value="">Tous les types</option>
                  <option value="vente">Vente</option>
                  <option value="location">Location</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ville" className="text-[#1A1A2E]">
                  <MapPin className="h-4 w-4 inline mr-1.5 text-[#FF385C]" />
                  Ville
                </Label>
                <Input
                  id="ville"
                  name="ville"
                  placeholder="Lom&eacute;, ..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetMax" className="text-[#1A1A2E]">
                  <DollarSign className="h-4 w-4 inline mr-1.5 text-[#FF385C]" />
                  Budget maximum (FCFA)
                </Label>
                <Input
                  id="budgetMax"
                  name="budgetMax"
                  type="number"
                  placeholder="50 000 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="superficieMin" className="text-[#1A1A2E]">
                  <Ruler className="h-4 w-4 inline mr-1.5 text-[#FF385C]" />
                  Superficie minimale (m&sup2;)
                </Label>
                <Input
                  id="superficieMin"
                  name="superficieMin"
                  type="number"
                  placeholder="50"
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Bell className="h-4 w-4" /> Cr&eacute;er mon alerte
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Vous pouvez vous d&eacute;sinscrire &agrave; tout moment.
            Aucun spam, seulement des biens correspondant &agrave; vos crit&egrave;res.
          </p>
        </div>
      </div>
    </div>
  )
}
