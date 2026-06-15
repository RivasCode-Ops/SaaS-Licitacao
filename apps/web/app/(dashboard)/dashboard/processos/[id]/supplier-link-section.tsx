"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Link2, Unlink, X, Check, ThumbsUp, ThumbsDown, Download } from "lucide-react"
import { linkSupplierAction, unlinkSupplierAction, updateProposalStatusAction } from "@/lib/db/actions"

type LinkedSupplier = {
  id: number
  supplierId: number
  companyName: string
  cnpj: string
  tradeName: string | null
  proposalValue: string | null
  proposalFile: string | null
  status: string
}

type AvailableSupplier = {
  id: number
  companyName: string
  cnpj: string
}

export function SupplierLinkSection({
  linked,
  available,
  processId,
}: {
  linked: LinkedSupplier[]
  available: AvailableSupplier[]
  processId: number
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    form.set("processId", String(processId))
    const result = await linkSupplierAction(form)
    setLoading(false)
    if (result?.success) {
      setOpen(false)
      router.refresh()
    }
  }

  async function handleUnlink(supplierId: number) {
    if (!confirm("Desvincular este fornecedor do processo?")) return
    await unlinkSupplierAction(processId, supplierId)
    router.refresh()
  }

  async function handleStatus(id: number, status: "approved" | "rejected") {
    if (status === "rejected" && !confirm("Rejeitar esta proposta?")) return
    await updateProposalStatusAction(id, status)
    router.refresh()
  }

  const alreadyLinked = new Set(linked.map((l) => l.supplierId))
  const unlinked = available.filter((a) => !alreadyLinked.has(a.id))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Fornecedores Vinculados</h2>
        {unlinked.length > 0 && (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            <Link2 className="size-3.5" /> Vincular Fornecedor
          </button>
        )}
      </div>

      {linked.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Building2 className="size-8 mx-auto mb-2 opacity-50 text-muted" />
          <p className="text-sm text-muted">
            Nenhum fornecedor vinculado a este processo.
          </p>
          {unlinked.length > 0 && (
            <button
              onClick={() => setOpen(true)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Vincular fornecedores qualificados
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {linked.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">{s.companyName}</p>
                <p className="text-xs text-muted">{s.cnpj}</p>
                {s.proposalValue && (
                  <p className="text-xs text-muted mt-0.5">
                    Proposta: <span className="font-medium">R$ {s.proposalValue}</span>
                  </p>
                )}
                {s.proposalFile && (
                  <a
                    href={s.proposalFile}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                  >
                    <Download className="size-3" /> Arquivo
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    s.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : s.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : s.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {s.status === "approved"
                    ? "Aprovada"
                    : s.status === "rejected"
                      ? "Rejeitada"
                      : s.status === "pending"
                        ? "Pendente"
                        : s.status}
                </span>
                {s.status === "pending" && s.proposalValue && (
                  <>
                    <button
                      onClick={() => handleStatus(s.id, "approved")}
                      className="p-1 text-green-600 hover:text-green-800 rounded"
                      title="Aprovar"
                    >
                      <ThumbsUp className="size-4" />
                    </button>
                    <button
                      onClick={() => handleStatus(s.id, "rejected")}
                      className="p-1 text-red-600 hover:text-red-800 rounded"
                      title="Rejeitar"
                    >
                      <ThumbsDown className="size-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleUnlink(s.supplierId)}
                  className="p-1 text-muted hover:text-danger rounded"
                  title="Desvincular"
                >
                  <Unlink className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Vincular Fornecedores</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-muted hover:text-foreground rounded"
              >
                <X className="size-5" />
              </button>
            </div>

            {unlinked.length === 0 ? (
              <p className="text-sm text-muted">
                Todos os fornecedores qualificados já estão vinculados.
              </p>
            ) : (
              <form onSubmit={handleLink} className="space-y-3">
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {unlinked.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        name="supplierIds"
                        value={s.id}
                        className="size-4 accent-primary"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{s.companyName}</p>
                        <p className="text-xs text-muted">{s.cnpj}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                  >
                    <Check className="size-4" />
                    {loading ? "Vinculando..." : "Vincular"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
