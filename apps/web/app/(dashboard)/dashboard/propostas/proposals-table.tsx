"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ThumbsUp, ThumbsDown, ExternalLink, Download } from "lucide-react"
import { updateProposalStatusAction } from "@/lib/db/actions"

type Proposal = {
  id: number
  processId: number
  processTitle: string
  processNumber: string
  processYear: number
  supplierId: number
  companyName: string
  cnpj: string
  proposalValue: string | null
  proposalFile: string | null
  status: string
  createdAt: Date
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
  withdrawn: "Retirada",
}

export function ProposalsTable({
  proposals,
}: {
  proposals: Proposal[]
}) {
  const router = useRouter()

  async function handleStatus(id: number, status: "approved" | "rejected") {
    if (status === "rejected" && !confirm("Rejeitar esta proposta?")) return
    await updateProposalStatusAction(id, status)
    router.refresh()
  }

  if (proposals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <p className="text-muted">Nenhuma proposta recebida ainda.</p>
        <p className="text-xs text-muted mt-2">
          As propostas aparecerão aqui quando fornecedores enviarem pelo portal.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-gray-50 text-left">
            <th className="px-4 py-3 font-medium">Fornecedor</th>
            <th className="px-4 py-3 font-medium">CNPJ</th>
            <th className="px-4 py-3 font-medium">Processo</th>
            <th className="px-4 py-3 font-medium">Valor</th>
            <th className="px-4 py-3 font-medium">Arquivo</th>
            <th className="px-4 py-3 font-medium">Data</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p) => (
            <tr
              key={p.id}
              className="border-b border-border last:border-0 hover:bg-gray-50"
            >
              <td className="px-4 py-3">
                <span className="font-medium">{p.companyName}</span>
              </td>
              <td className="px-4 py-3 text-muted">{p.cnpj}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/processos/${p.processId}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {p.processTitle}
                  <ExternalLink className="size-3" />
                </Link>
              </td>
              <td className="px-4 py-3">
                {p.proposalValue ? (
                  <span className="font-medium">R$ {p.proposalValue}</span>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {p.proposalFile ? (
                  <a
                    href={p.proposalFile}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <Download className="size-3.5" /> Download
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td className="px-4 py-3 text-muted">
                {new Date(p.createdAt).toLocaleDateString("pt-BR")}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[p.status] || ""}`}
                >
                  {STATUS_LABEL[p.status] || p.status}
                </span>
              </td>
              <td className="px-4 py-3">
                {p.status === "pending" && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStatus(p.id, "approved")}
                      className="p-1.5 text-green-600 hover:text-green-800 rounded hover:bg-green-50"
                      title="Aprovar"
                    >
                      <ThumbsUp className="size-4" />
                    </button>
                    <button
                      onClick={() => handleStatus(p.id, "rejected")}
                      className="p-1.5 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                      title="Rejeitar"
                    >
                      <ThumbsDown className="size-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
