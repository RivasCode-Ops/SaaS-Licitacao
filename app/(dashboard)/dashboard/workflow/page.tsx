import { getSession } from "@/lib/auth/session"
import { getProcessesByOrgan } from "@/lib/db/queries"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ProcessTimeline, CreateProcessForm } from "./workflow-form"

export const dynamic = "force-dynamic"

export default async function WorkflowPage() {
  const session = await getSession()
  const processes = session?.user?.organId ? await getProcessesByOrgan(session.user.organId) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workflow</h1>
        <CreateProcessForm />
      </div>

      {processes.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <p className="text-muted">Nenhum processo licitatório iniciado.</p>
          <p className="text-sm text-muted mt-1">
            Crie um novo processo para acompanhar as etapas.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {processes.map((process) => (
            <div
              key={process.id}
              className="rounded-xl border border-border bg-white p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Link
                    href={`/dashboard/processos/${process.id}`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {process.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {process.number}/{process.year}
                  </p>
                </div>
                <span className="text-xs uppercase font-medium text-muted bg-gray-100 px-2 py-1 rounded">
                  {process.modality}
                </span>
              </div>
              <ProcessTimeline
                processId={process.id}
                stages={process.stages.map((s) => ({
                  id: s.id,
                  name: s.name,
                  order: s.order,
                  status: s.status,
                  date: s.completedAt
                    ? new Date(s.completedAt).toLocaleDateString("pt-BR")
                    : s.startedAt
                    ? "Em andamento"
                    : "Aguardando",
                  deadline: s.notes?.replace("Prazo limite: ", "") || null,
                }))}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
