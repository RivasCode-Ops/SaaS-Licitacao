"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, X } from "lucide-react"
import {
  createOrganAction,
  deleteOrganAction,
} from "@/lib/db/actions"

export function CreateOrganForm() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const result = await createOrganAction(form)
    if (result?.error) {
      setError(result.error)
    } else {
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
        <Plus className="size-4" /> Novo Órgão
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

        <h2 className="text-lg font-semibold">Novo Órgão</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Nome*</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CNPJ*</label>
          <input
            name="cnpj"
            required
            placeholder="11.222.333/0001-44"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Criar
        </button>
      </form>
    </div>
  )
}

export function DeleteOrganButton({ id }: { id: number }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm("Excluir este órgão?")) return
    await deleteOrganAction(id)
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
