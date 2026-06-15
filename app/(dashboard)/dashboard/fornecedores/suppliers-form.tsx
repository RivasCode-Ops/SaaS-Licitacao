"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, X } from "lucide-react"
import {
  createSupplierAction,
  deleteSupplierAction,
  updateSupplierStatusAction,
} from "@/lib/db/actions"

type StatusType = "pending" | "qualified" | "disqualified"

const statusLabels: Record<StatusType, string> = {
  pending: "Em análise",
  qualified: "Habilitado",
  disqualified: "Desabilitado",
}

const statusColors: Record<StatusType, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  qualified: "bg-green-100 text-green-700",
  disqualified: "bg-red-100 text-red-700",
}

export function SupplierStatusBadge({
  id,
  status,
}: {
  id: number
  status: string
}) {
  const router = useRouter()
  const s = status as StatusType

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await updateSupplierStatusAction(id, e.target.value as StatusType)
    router.refresh()
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      className={`text-xs font-medium px-2 py-1 rounded-full border-none cursor-pointer ${statusColors[s]}`}
    >
      <option value="pending">Em análise</option>
      <option value="qualified">Habilitado</option>
      <option value="disqualified">Desabilitado</option>
    </select>
  )
}

export function CreateSupplierForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const result = await createSupplierAction(form)
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
        <Plus className="size-4" /> Novo Fornecedor
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
        <h2 className="text-lg font-semibold">Novo Fornecedor</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Razão Social*</label>
          <input
            name="companyName"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNPJ*</label>
          <input
            name="cnpj"
            required
            placeholder="44.555.666/0001-77"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input
              name="phone"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cidade</label>
            <input
              name="city"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">UF</label>
            <input
              name="state"
              maxLength={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
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

export function DeleteSupplierButton({ id }: { id: number }) {
  const router = useRouter()
  async function handleDelete() {
    if (!confirm("Excluir este fornecedor?")) return
    await deleteSupplierAction(id)
    router.refresh()
  }
  return (
    <button
      onClick={handleDelete}
      className="text-muted hover:text-danger transition-colors"
      title="Excluir"
    >
      <Trash2 className="size-4" />
    </button>
  )
}
