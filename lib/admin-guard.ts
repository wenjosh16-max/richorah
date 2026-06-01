import { auth } from "./auth"

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.email) {
    throw new Error("Non autorisé")
  }
  return session
}
