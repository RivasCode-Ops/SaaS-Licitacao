"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-danger">Erro no dashboard</h2>
        <p className="text-sm text-muted">
          {error.message || "Não foi possível carregar os dados."}
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
