"use client"

import { useActionState } from "react"
import { submitProposalAction } from "../actions"

export function ProposalForm({ processId }: { processId: number }) {
  const [state, action, pending] = useActionState(submitProposalAction, {})

  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      <input type="hidden" name="processId" value={processId} />
      <div>
        <label className="block text-sm font-medium mb-1">
          Valor da Proposta (R$)
        </label>
        <input
          name="proposalValue"
          type="text"
          required
          placeholder="Ex: 150.000,00"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Documento da Proposta (opcional)
        </label>
        <input
          type="file"
          name="proposalFile"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
          className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600">
          Proposta enviada com sucesso!
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar Proposta"}
      </button>
    </form>
  )
}
