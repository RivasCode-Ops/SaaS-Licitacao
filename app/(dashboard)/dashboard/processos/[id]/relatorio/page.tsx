import { getSession } from "@/lib/auth/session"
import { getProcessWithStages } from "@/lib/db/queries"
import { redirect, notFound } from "next/navigation"
import { FileText, Printer } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

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

const stageStatusLabel: Record<string, string> = {
  pending: "Pendente",
  active: "Em andamento",
  completed: "Concluída",
  cancelled: "Cancelada",
}

export default async function RelatorioPage({
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

  const activeStage = process.stages.find((s) => s.status === "active")
  const stagesWithDeadlines = process.stages.map((s) => ({
    ...s,
    deadline: s.notes?.replace("Prazo limite: ", "") || null,
  }))

  return (
    <div className="min-h-screen bg-white print:bg-white">
      {/* Toolbar (hidden on print) */}
      <div className="print:hidden border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/dashboard/processos/${id}`}
            className="text-sm text-muted hover:text-foreground"
          >
            ← Voltar
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            <Printer className="size-4" />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Report content */}
      <div className="max-w-4xl mx-auto px-4 py-8 print:py-4">
        {/* Header */}
        <div className="text-center mb-8 print:mb-6 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-900">{process.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {process.number}/{process.year} · {stageNames[process.modality] || process.modality}
          </p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-medium">Número</p>
            <p className="text-sm font-medium mt-1">{process.number}/{process.year}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-medium">Modalidade</p>
            <p className="text-sm font-medium mt-1">{stageNames[process.modality] || process.modality}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
            <p className="text-sm font-medium mt-1">{activeStage?.name || "Concluído"}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-medium">Criado em</p>
            <p className="text-sm font-medium mt-1">
              {new Date(process.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        {process.description && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Descrição</h2>
            <p className="text-sm text-gray-700 leading-relaxed">{process.description}</p>
          </div>
        )}

        {/* Stages timeline */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Etapas do Processo</h2>
          <div className="space-y-3">
            {stagesWithDeadlines.map((stage, i) => (
              <div
                key={stage.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex flex-col items-center">
                  <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    stage.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : stage.status === "active"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {i + 1}
                  </div>
                  {i < stagesWithDeadlines.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 my-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{stage.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      stage.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : stage.status === "active"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {stageStatusLabel[stage.status] || stage.status}
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    {stage.startedAt && (
                      <span>Início: {new Date(stage.startedAt).toLocaleDateString("pt-BR")}</span>
                    )}
                    {stage.completedAt && (
                      <span>Conclusão: {new Date(stage.completedAt).toLocaleDateString("pt-BR")}</span>
                    )}
                    {stage.deadline && (
                      <span>Prazo: {stage.deadline}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Documentos</h2>
          {process.documents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
              Nenhum documento anexado.
            </p>
          ) : (
            <div className="space-y-2">
              {process.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="size-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {doc.type} · {new Date(doc.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
          Relatório gerado em {new Date().toLocaleString("pt-BR")} · SaaS Licitação
        </div>
      </div>
    </div>
  )
}
