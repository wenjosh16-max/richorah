"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send } from "lucide-react"

const QUICK_MESSAGES = [
  { label: "Bonjour, je cherche un bien", msg: "Bonjour, je suis intéressé par vos biens immobiliers. Pouvez-vous me contacter ?" },
  { label: "Je veux vendre", msg: "Bonjour, je souhaiterais mettre en vente mon bien immobilier. Pouvez-vous me conseiller ?" },
  { label: "Estimation gratuite", msg: "Bonjour, je voudrais une estimation gratuite de mon bien." },
]

export default function WhatsAppButton({ message }: { message?: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"whatsapp" | "message">("whatsapp")
  const [nom, setNom] = useState("")
  const [telephone, setTelephone] = useState("")
  const [msg, setMsg] = useState("")

  const waUrl = (text: string) =>
    `https://wa.me/22870628696?text=${encodeURIComponent(text)}`

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (nom.trim().length < 2) return
    if (telephone.trim().length < 6) return
    if (msg.trim().length < 10) return
    const texte = `Nom: ${nom.trim()}\nTél: ${telephone.trim()}\n\n${msg.trim()}`
    window.open(waUrl(texte), "_blank")
    setNom("")
    setTelephone("")
    setMsg("")
    setOpen(false)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 overflow-hidden"
          >
            <div className="bg-green-500 p-3 text-white">
              <p className="text-sm font-bold">Besoin d&apos;aide ?</p>
              <p className="text-[11px] opacity-80">Réponse immédiate sur WhatsApp</p>
            </div>

            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setTab("whatsapp")}
                className={`flex-1 text-center py-2.5 text-xs font-semibold transition-colors ${
                  tab === "whatsapp" ? "text-green-600 border-b-2 border-green-500" : "text-[#717171] hover:text-[#222]"
                }`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setTab("message")}
                className={`flex-1 text-center py-2.5 text-xs font-semibold transition-colors ${
                  tab === "message" ? "text-green-600 border-b-2 border-green-500" : "text-[#717171] hover:text-[#222]"
                }`}
              >
                Message
              </button>
            </div>

            {tab === "whatsapp" ? (
              <div className="p-2 space-y-1">
                {QUICK_MESSAGES.map((qm) => (
                  <a
                    key={qm.label}
                    href={waUrl(qm.msg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl text-sm text-[#222] hover:bg-green-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4 text-green-500 shrink-0" />
                    {qm.label}
                  </a>
                ))}
                {message && (
                  <a
                    href={waUrl(message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-xl text-sm text-green-700 font-medium hover:bg-green-50 transition-colors border-t border-gray-100 mt-1 pt-3"
                    onClick={() => setOpen(false)}
                  >
                    <MessageCircle className="h-4 w-4 text-green-500 shrink-0" />
                    Partager ce bien →
                  </a>
                )}
                <a
                  href={waUrl("Bonjour, j'aimerais avoir plus d'informations.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl text-sm text-green-700 font-medium hover:bg-green-50 transition-colors border-t border-gray-100 mt-1 pt-3"
                  onClick={() => setOpen(false)}
                >
                  <MessageCircle className="h-4 w-4 text-green-500 shrink-0" />
                  Autre demande →
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <p className="text-xs text-gray-500 mb-1">
                  Le message sera envoyé directement sur WhatsApp
                </p>
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
                <input
                  type="tel"
                  placeholder="Votre téléphone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
                <textarea
                  placeholder="Votre message..."
                  rows={3}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 resize-none"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Send className="h-4 w-4" /> Envoyer sur WhatsApp
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-4 sm:right-6 z-40 flex flex-col items-center gap-3">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all active:scale-95"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
        </button>
      </div>
    </>
  )
}
