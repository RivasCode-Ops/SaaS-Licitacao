import { getSession } from "@saas/auth"
import { redirect } from "next/navigation"
import { getAllProposals } from "@/lib/db/queries"
import { ProposalsTable } from "./proposals-table"

export const dynamic = "force-dynamic"

export default async function PropostasPage() {
  const session = await getSession()
  if (!session?.user?.organId) redirect("/login/sign-in")

  const proposals = await getAllProposals(session.user.organId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Propostas</h1>
        <p className="text-sm text-muted mt-1">
          {proposals.length} proposta(s) recebida(s)
        </p>
      </div>

      <ProposalsTable proposals={proposals} />
    </div>
  )
}
