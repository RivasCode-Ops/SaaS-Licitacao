import { getSession } from "@saas/auth"
import { redirect, notFound } from "next/navigation"
import { db, processSuppliers, biddingProcesses, processStages, organs } from "@saas/db"
import { eq, and, asc } from "drizzle-orm"
import { ProposalForm } from "./proposal-form"

const STAGE_LABEL: Record<string, string> = {
  pending: "Pendente",
  active: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
}

export default async function ProcessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  if (!session?.user?.supplierId) redirect("/login")

  const processId = Number(id)
  if (isNaN(processId)) notFound()

  const link = await db.query.processSuppliers.findFirst({
    where: and(
      eq(processSuppliers.processId, processId),
      eq(processSuppliers.supplierId, session.user.supplierId)
    ),
  })

  if (!link) notFound()

  const [process] = await db
    .select()
    .from(biddingProcesses)
    .where(eq(biddingProcesses.id, processId))
    .limit(1)

  if (!process) notFound()

  const [organ] = await db
    .select()
    .from(organs)
    .where(eq(organs.id, process.organId))
    .limit(1)

  const stages = await db
    .select()
    .from(processStages)
    .where(eq(processStages.processId, processId))
    .orderBy(asc(processStages.order))

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <a
        href="/dashboard"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        &larr; Voltar
      </a>

      <h1 className="text-2xl font-bold mb-2">{process.title}</h1>
      <p className="text-muted text-sm mb-6">
        {process.number}/{process.year} — {organ?.name}
      </p>

      <section className="mb-8">
        <h2 className="font-semibold mb-2">Etapas do Processo</h2>
        <div className="space-y-2">
          {stages.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-2 text-sm"
            >
              <span>
                {s.order}. {s.name}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {STAGE_LABEL[s.status] || s.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Minha Proposta</h2>
        {link.proposalValue ? (
          <div className="rounded-lg border border-border bg-white p-4">
            <p className="text-sm">
              Status:{" "}
              <span className="font-medium">{link.status}</span>
            </p>
            <p className="text-sm mt-2">
              Valor proposto:{" "}
              <span className="font-medium">R$ {link.proposalValue}</span>
            </p>
          </div>
        ) : (
          <ProposalForm processId={processId} />
        )}
      </section>
    </main>
  )
}
