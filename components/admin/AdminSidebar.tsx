"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Megaphone,
  FileText,
  Bell,
  Activity,
  Download,
  LogOut,
  Menu,
  X,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Biens", href: "/admin/biens", icon: Building2 },
  { name: "Messages", href: "/admin/messages", icon: MessageSquare },
  { name: "Promotions", href: "/admin/promotions", icon: Megaphone },
  { name: "Contenus", href: "/admin/contenus", icon: FileText },
  { name: "Témoignages", href: "/admin/temoignages", icon: Star },
  { name: "Alertes", href: "/admin/alertes", icon: Bell },
  { name: "Activité", href: "/admin/activite", icon: Activity },
  { name: "Sauvegarde", href: "/admin/sauvegarde", icon: Download },
]

export default function AdminSidebar({
  badgeUnreadMessages = 0,
  badgeOldProperties = 0,
}: {
  badgeUnreadMessages?: number
  badgeOldProperties?: number
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white text-[#222] p-2.5 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white flex flex-col lg:hidden border-r border-gray-200"
          >
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-bold tracking-tight text-[#222]">
                  richorah
                </span>
                <span className="text-[10px] font-medium text-[#717171] uppercase tracking-wider ml-1">
                  admin
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[#717171] hover:text-[#222] transition-colors"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              pathname={pathname}
              badgeUnreadMessages={badgeUnreadMessages}
              badgeOldProperties={badgeOldProperties}
              onNavigate={() => setMobileOpen(false)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex items-center h-16 px-6 border-b border-gray-100">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-[#222]">
              richorah
            </span>
            <span className="text-[10px] font-medium text-[#717171] uppercase tracking-wider ml-1">
              admin
            </span>
          </Link>
        </div>
        <SidebarContent
          pathname={pathname}
          badgeUnreadMessages={badgeUnreadMessages}
          badgeOldProperties={badgeOldProperties}
        />
      </aside>
    </>
  )
}

function SidebarContent({
  pathname,
  badgeUnreadMessages,
  badgeOldProperties,
  onNavigate,
}: {
  pathname: string
  badgeUnreadMessages: number
  badgeOldProperties: number
  onNavigate?: () => void
}) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href)

          let badgeCount = 0
          if (item.href === "/admin/messages") badgeCount = badgeUnreadMessages
          if (item.href === "/admin/biens") badgeCount = badgeOldProperties

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#FFF0F3] text-primary"
                  : "text-[#717171] hover:text-[#222] hover:bg-gray-50"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 truncate">{item.name}</span>
              {badgeCount > 0 && (
                <span
                  className={cn(
                    "flex-shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
                    item.href === "/admin/messages"
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-[#717171]"
                  )}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-[#FFF0F3] transition-all duration-200 w-full"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
