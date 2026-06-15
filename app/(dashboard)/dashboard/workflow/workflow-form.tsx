"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, ArrowRight } from "lucide-react"
import {
  createProcessAction,
  advanceStageAction,
  deleteProcessAction,
} from "@/lib/db/actions"

type StageItem = {
  id: number
  name: string
  order: number
  status: string
  date: string
  deadline?: string | null
}

export function ProcessTimeline({
  processId,
  stages,
}: {
  processId: number
  stages: StageItem[]
}) {
  const router = useRouter()

  async function handleAdvance(stageId: number) {
    await advanceStageAction(stageId)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm("Excluir este processo?")) return
    await deleteProcessAction(processId)
    router.refresh()
  }

  return (
    <div className="space-y-0">
      {stages.map((stage, i) => (
        <div key={stage.id} className="flex items-start gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <div
              className={`size-8 rounded-full flex items-center justify-center text-sm font-medium ${
                stage.status === "completed"
                  ? "bg-green-500 text-white"
                  : stage.status === "active"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {stage.status === "completed" ? "✓" : stage.order}
            </div>
            {i < stages.length - 1 && (
              <div className="w-px flex-1 bg-gray-200 min-h-6" />
            )}
          </div>
          <div className="pt-1.5 flex-1 flex items-center justify-between">
            <div>
              <h3
                className={`font-medium ${
                  stage.status === "active" ? "text-primary" : ""
                }`}
              >
                {stage.name}
              </h3>
              <p className="text-sm text-muted">{stage.date}</p>
              {stage.deadline && (
                <p className="text-xs text-muted mt-0.5">
                  Prazo: {stage.deadline}
                </p>
              )}
            </div>
            {stage.status === "active" && (
              <button
                onClick={() => handleAdvance(stage.id)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Avançar <ArrowRight className="size-3" />
              </button>
            )}
          </div>
        </div>
      ))}
      <div className="text-right mt-2">
        <button
          onClick={handleDelete}
          className="text-xs text-muted hover:text-danger"
        >
          Excluir processo
        </button>
      </div>
    </div>
  )
}

const modalities = [
  "pregao",
  "concorrencia",
  "tomada_precos",
  "convite",
  "concurso",
  "leilao",
  "dispensa",
  "inexigibilidade",
]

const modalityLabels: Record<string, string> = {
  pregao: "Pregão",
  concorrencia: "Concorrência",
  tomada_precos: "Tomada de Preços",
  convite: "Convite",
  concurso: "Concurso",
  leilao: "Leilão",
  dispensa: "Dispensa",
  inexigibilidade: "Inexigibilidade",
}

export function CreateProcessForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const result = await createProcessAction(form)
    if (result?.error) setError(result.error)
    else {
      setOpen(false)
      router.refresh()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
      >
        <Plus className="size-4" /> Novo Processo
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 relative"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
        <h2 className="text-lg font-semibold">Novo Processo</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Título*</label>
          <input
            name="title"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Número*
            </label>
            <input
              name="number"
              required
              placeholder="001"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ano</label>
            <input
              name="year"
              type="number"
              defaultValue={new Date().getFullYear()}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Modalidade*
          </label>
          <select
            name="modality"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            {modalities.map((m) => (
              <option key={m} value={m}>
                {modalityLabels[m]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            name="description"
            rows={3}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
        >
          Criar
        </button>
      </form>
    </div>
  )
}
