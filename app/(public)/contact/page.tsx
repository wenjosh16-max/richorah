"use client"

import { useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { envoyerMessage } from "./actions"
import Image from "next/image"
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  Smartphone,
} from "lucide-react"

const CONTACTS = [
  {
    icon: Phone,
    label: "T&eacute;l&eacute;phone",
    value: "70 62 86 96",
    href: "tel:+22870628696",
  },
  {
    icon: Smartphone,
    label: "Mobile",
    value: "97 55 55 82",
    href: "tel:+22897555582",
  },
  {
    icon: Mail,
    label: "Email",
    value: "Richorahimmobilier04@gmail.com",
    href: "mailto:Richorahimmobilier04@gmail.com",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Lom&eacute;, Togo",
    href: null,
  },
  {
    icon: MessageSquare,
    label: "WhatsApp",
    value: "70 62 86 96",
    href: "https://wa.me/22870628696",
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Lun - Sam : 8h00 - 18h00",
    href: null,
  },
]

export default function ContactPage() {
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    const result = await envoyerMessage(formData)

    if (result.success) {
      toast({ title: "Message envoy&eacute;", description: result.message })
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
    <div className="min-h-screen bg-[#F8F7F4]">
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&q=80"
            alt="Nous contacter"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/80 text-xs tracking-widest uppercase font-medium mb-4">
            Contact
          </div>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">
            Contactez-nous
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Une question, un projet&nbsp;? Nous sommes là pour vous accompagner.
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A2E] mb-8">
                Nos coordonn&eacute;es
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {CONTACTS.map((c) => {
                  const Icon = c.icon
                  const content = (
                    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 bg-[#FF385C]/10 rounded-lg flex items-center justify-center mb-3">
                        <Icon className="h-5 w-5 text-[#FF385C]" />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{c.label}</p>
                      {c.href ? (
                        <a
                          href={c.href}
                          target={c.href.startsWith("http") ? "_blank" : undefined}
                          rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="font-medium text-[#1A1A2E] hover:text-[#FF385C] transition-colors"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="font-medium text-[#1A1A2E]">{c.value}</p>
                      )}
                    </div>
                  )
                  return <div key={c.label}>{content}</div>
                })}
              </div>

              <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1014849.5378097733!2d0.5262369062503213!3d6.131859654373621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1023671b8c35657d%3A0x2f9b5b8b0b0b0b0!2sLom%C3%A9%2C%20Togo!5e0!3m2!1sfr!2sfr!4v1!4m5!3m4!1s0x1023671b8c35657d%3A0x2f9b5b8b0b0b0b0!8m2!3d6.1318597!4d1.2237898"
                  width="100%"
                  height="350"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Richorah Immobilier - Lomé"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#1A1A2E] mb-8">
                Envoyez-nous un message
              </h2>

              <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                <form ref={formRef} action={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="nom" className="text-[#1A1A2E]">
                      Nom complet *
                    </Label>
                    <Input
                      id="nom"
                      name="nom"
                      placeholder="Votre nom"
                      required
                      minLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone" className="text-[#1A1A2E]">
                      T&eacute;l&eacute;phone *
                    </Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      type="tel"
                      placeholder="70 00 00 00"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#1A1A2E]">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[#1A1A2E]">
                      Message *
                    </Label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      minLength={10}
                      placeholder="D&eacute;crivez votre projet ou votre question..."
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF385C] focus:border-transparent resize-y min-h-[120px]"
                    />
                  </div>

                  <input type="hidden" name="bienId" value="" />

                  <Button type="submit" className="w-full gap-2">
                    <Send className="h-4 w-4" /> Envoyer le message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
