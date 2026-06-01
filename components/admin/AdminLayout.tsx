"use client"

import { SessionProvider, useSession } from "next-auth/react"
import Link from "next/link"
import AdminSidebar from "./AdminSidebar"
import NotificationBell from "./NotificationBell"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

function LayoutContent({
  children,
  badgeUnreadMessages,
  badgeOldProperties,
}: {
  children: React.ReactNode
  badgeUnreadMessages: number
  badgeOldProperties: number
}) {
  const { data: session } = useSession()

  const today = new Date()
  const dateStr = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AdminSidebar
        badgeUnreadMessages={badgeUnreadMessages}
        badgeOldProperties={badgeOldProperties}
      />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8 ml-12 lg:ml-0">
            <div>
              <h1 className="text-lg font-bold text-[#222]">
                Bonjour, {session?.user?.name || "Richorah"}
              </h1>
              <p className="text-xs text-[#717171] mt-0.5">
                {dateStr} · Lomé, Togo
              </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <NotificationBell />
              <Button asChild className="bg-primary hover:bg-[#E02D4F] gap-1 sm:gap-1.5 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4">
                <Link href="/admin/biens/nouveau">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter un bien</span>
                  <span className="sm:hidden">Ajouter</span>
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

export default function AdminLayout({
  children,
  badgeUnreadMessages = 0,
  badgeOldProperties = 0,
}: {
  children: React.ReactNode
  badgeUnreadMessages?: number
  badgeOldProperties?: number
}) {
  return (
    <SessionProvider>
      <LayoutContent
        badgeUnreadMessages={badgeUnreadMessages}
        badgeOldProperties={badgeOldProperties}
      >
        {children}
      </LayoutContent>
    </SessionProvider>
  )
}
