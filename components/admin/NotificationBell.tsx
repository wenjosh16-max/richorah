"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Bell, MessageSquare, BellRing, BellOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

interface RecentMessage {
  id: string
  nom: string
  telephone: string
  message: string
  createdAt: string
  bienId: string | null
}

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [recent, setRecent] = useState<RecentMessage[]>([])
  const [open, setOpen] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const prevCountRef = useRef(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("admin_notif_enabled")
    if (saved === "true") setNotifEnabled(true)
  }, [])

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return
    if (Notification.permission === "granted") return true
    if (Notification.permission === "denied") return false
    const result = await Notification.requestPermission()
    return result === "granted"
  }, [])

  const toggleNotif = useCallback(async () => {
    if (!notifEnabled) {
      const granted = await requestPermission()
      if (granted) {
        setNotifEnabled(true)
        localStorage.setItem("admin_notif_enabled", "true")
      }
    } else {
      setNotifEnabled(false)
      localStorage.setItem("admin_notif_enabled", "false")
    }
  }, [notifEnabled, requestPermission])

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await fetch("/api/messages/count")
        if (!res.ok) return
        const data = await res.json()
        const newCount: number = data.count
        const prevCount = prevCountRef.current

        setCount(newCount)
        setRecent(data.recent)
        prevCountRef.current = newCount

        if (notifEnabled && "Notification" in window && Notification.permission === "granted") {
          if (newCount > prevCount && prevCount > 0 && data.recent?.length > 0) {
            const latest = data.recent[0]
            new Notification("Nouveau message - Richorah", {
              body: `${latest.nom}: ${latest.message.slice(0, 80)}`,
              icon: "/favicon.ico",
              tag: "richorah-new-message",
            })
          }
        }
      } catch {
        // silencieux
      }
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 15000)
    return () => clearInterval(interval)
  }, [notifEnabled])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "à l'instant"
    if (mins < 60) return `il y a ${mins} min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `il y a ${hours}h`
    return `il y a ${Math.floor(hours / 24)}j`
  }

  return (
    <div className="relative" ref={dropdownRef}>
        <button
        onClick={async () => {
          setOpen(!open)
          if (!open && count > 0) {
            try {
              await fetch("/api/messages/lire", { method: "POST" })
              setCount(0)
              setRecent([])
            } catch {}
          }
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-[#717171]" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[#222]">Messages récents</p>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleNotif() }}
                  className={`p-1 rounded transition-colors ${notifEnabled ? "text-primary hover:bg-[#FFF0F3]" : "text-gray-400 hover:bg-gray-100"}`}
                  title={notifEnabled ? "Désactiver les notifications" : "Activer les notifications"}
                >
                  {notifEnabled ? <BellRing className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                </button>
              </div>
              {count > 0 && (
                <Link
                  href="/admin/messages"
                  onClick={() => setOpen(false)}
                  className="text-xs text-primary font-medium hover:underline"
                >
                  Tout voir
                </Link>
              )}
            </div>
            {recent.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-[#717171]">Aucun nouveau message</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {recent.map((msg) => (
                  <Link
                    key={msg.id}
                    href="/admin/messages"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-[#FFF0F3] transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-[#222] truncate">
                        {msg.nom}
                      </p>
                      <span className="text-[10px] text-[#717171] shrink-0">
                        {timeAgo(msg.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-[#717171] truncate mt-0.5">
                      {msg.message}
                    </p>
                    <p className="text-[10px] text-primary mt-0.5">
                      {msg.telephone}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
