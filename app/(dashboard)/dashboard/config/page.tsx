import { getSession } from "@/lib/auth/session"
import { getOrganById } from "@/lib/db/queries"
import { redirect } from "next/navigation"
import { ConfigForm } from "./config-form"

export const dynamic = "force-dynamic"

export default async function ConfigPage() {
  const session = await getSession()
  if (!session) redirect("/login/sign-in")

  const organ = await getOrganById(session.user.organId)
  if (!organ) redirect("/login/sign-in")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <ConfigForm organ={organ} userEmail={session.user.email} userName={session.user.name} />
    </div>
  )
}
