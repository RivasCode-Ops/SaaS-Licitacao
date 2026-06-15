import { getSession } from "@/lib/auth/session"
import { getProcessWithStages } from "@/lib/db/queries"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft, FileText, Printer } from "lucide-react"
import Link from "next/link"
import { DocumentList } from "./document-list"
import { UploadForm } from "./upload-form"

export const dynamic = "force-dynamic"

export default async function ProcessoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session?.user?.organId) redirect("/login/sign-in")

  const { id } = await params
  const process = await getProcessWithStages(parseInt(id))
  if (!process) notFound()
  if (process.organId !== session.user.organId) notFound()

  const stageNames: Record<string, string> = {
    pregao: "Pregão",
    concorrencia: "Concorrência",
    tomada_precos: "Tomada de Preços",
    convite: "Convite",
    concurso: "Concurso",
    leilao: "Leilão",
    dispensa: "Dispensa",
    inexigibilidade: "Inexigibilidade",
  }

  const activeStage = process.stages.find((s) => s.status === "active")

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/workflow"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar ao workflow
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{process.title}</h1>
            <p className="text-sm text-muted mt-1">
              {process.number}/{process.year} ·{" "}
              {stageNames[process.modality] || process.modality}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/processos/${process.id}/relatorio`}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-white hover:opacity-90"
            >
              <Printer className="size-3.5" /> Exportar PDF
            </Link>
            <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
              {activeStage?.name || "Concluído"}
            </span>
          </div>
        </div>
        {process.description && (
          <p className="text-sm text-muted mt-4">{process.description}</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Documentos</h2>
        <UploadForm processId={process.id} />
        <div className="mt-6">
          <DocumentList
            documents={process.documents.map((d) => ({
              id: d.id,
              name: d.name,
              type: d.type,
              url: d.url,
              createdAt: d.createdAt.toISOString(),
            }))}
            processId={process.id}
          />
        </div>
      </div>
    </div>
  )
}
