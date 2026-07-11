"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Check, MessageCircle, Home } from "lucide-react"

interface BienOption {
  id: string
  titre: string
}

const QUICK_MESSAGES = [
  { label: "Bonjour, je cherche un bien", msg: "Bonjour, je suis intéressé par vos biens immobiliers. Pouvez-vous me contacter ?" },
  { label: "Je veux vendre", msg: "Bonjour, je souhaiterais mettre en vente mon bien immobilier. Pouvez-vous me conseiller ?" },
  { label: "Estimation gratuite", msg: "Bonjour, je voudrais une estimation gratuite de mon bien." },
]

export default function FloatingMessageButton() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"message" | "whatsapp">("message")
  const [nom, setNom] = useState("")
  const [telephone, setTelephone] = useState("")
  const [message, setMessage] = useState("")
  const [bienId, setBienId] = useState("")
  const [biens, setBiens] = useState<BienOption[]>([])
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [config, setConfig] = useState({ telephone_whatsapp: "22870628696" })

  useEffect(() => {
    fetch("/api/biens")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBiens(data)
      })
      .catch(() => {})
    fetch("/api/parametres")
      .then((r) => r.json())
      .then((d) => {
        if (d.telephone_whatsapp) setConfig({ telephone_whatsapp: d.telephone_whatsapp })
      })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (nom.trim().length < 2) { setError("Nom trop court"); return }
    if (telephone.trim().length < 6) { setError("Téléphone invalide"); return }
    if (message.trim().length < 10) { setError("Message trop court (min 10 car.)"); return }
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: nom.trim(),
          telephone: telephone.trim(),
          message: message.trim(),
          bienId: bienId || null,
        }),
      })
      if (!res.ok) throw new Error("Erreur serveur")
      setSuccess(true)
      setNom("")
      setTelephone("")
      setMessage("")
      setBienId("")
      setTimeout(() => { setSuccess(false); setOpen(false) }, 2000)
    } catch {
      setError("Erreur. Veuillez réessayer.")
    } finally {
      setSending(false)
    }
  }

  function handleClose() {
    setOpen(false)
    setError("")
    setSuccess(false)
  }

  const waUrl = (text: string) =>
    `https://wa.me/${config.telephone_whatsapp}?text=${encodeURIComponent(text)}`

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 left-4 sm:left-6 z-40 bg-white rounded-2xl shadow-2xl border border-gray-100 w-[calc(100vw-32px)] sm:w-80 overflow-hidden"
          >
            <div className="bg-[#FF385C] p-3 text-white flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Nous contacter</p>
                <p className="text-[11px] opacity-80">Réponse sous 24h</p>
              </div>
              <button onClick={handleClose} className="text-white/80 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setTab("message")}
                className={`flex-1 text-center py-2.5 text-xs font-semibold transition-colors ${
                  tab === "message" ? "text-[#FF385C] border-b-2 border-[#FF385C]" : "text-[#717171] hover:text-[#222]"
                }`}
              >
                Message
              </button>
              <button
                onClick={() => setTab("whatsapp")}
                className={`flex-1 text-center py-2.5 text-xs font-semibold transition-colors ${
                  tab === "whatsapp" ? "text-[#FF385C] border-b-2 border-[#FF385C]" : "text-[#717171] hover:text-[#222]"
                }`}
              >
                WhatsApp
              </button>
            </div>

            {tab === "message" ? (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Votre nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <input
                  type="tel"
                  placeholder="Votre téléphone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <select
                  value={bienId}
                  onChange={(e) => setBienId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                >
                  <option value="">Sélectionner un bien (optionnel)</option>
                  {biens.map((b) => (
                    <option key={b.id} value={b.id}>{b.titre}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Votre message..."
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#E02D4F] transition-colors disabled:opacity-50"
                >
                  {sending ? (
                    "Envoi..."
                  ) : success ? (
                    <><Check className="h-4 w-4" /> Envoyé !</>
                  ) : (
                    <><Send className="h-4 w-4" /> Envoyer</>
                  )}
                </button>
              </form>
            ) : (
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
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-4 sm:left-6 z-40">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center w-14 h-14 bg-[#FF385C] text-white rounded-full shadow-lg hover:bg-[#E02D4F] transition-all active:scale-95"
          aria-label="Nous contacter"
        >
          {open ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </button>
      </div>
    </>
  )
}
