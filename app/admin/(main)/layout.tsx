import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/admin/AdminLayout"

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/admin/login")
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [unreadMessages, oldProperties] = await Promise.all([
    prisma.message.count({ where: { statut: "nouveau" } }),
    prisma.bien.count({
      where: {
        updatedAt: { lt: thirtyDaysAgo },
        published: true,
        statut: "actif",
      },
    }),
  ])

  return (
    <AdminLayout
      badgeUnreadMessages={unreadMessages}
      badgeOldProperties={oldProperties}
    >
      {children}
    </AdminLayout>
  )
}
