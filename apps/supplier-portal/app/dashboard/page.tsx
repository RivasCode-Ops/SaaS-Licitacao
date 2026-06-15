import { getSession } from "@saas/auth"
import { redirect } from "next/navigation"
import { getSupplierProcesses } from "@/lib/db/queries"
import Link from "next/link"

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovada",
  rejected: "Rejeitada",
  withdrawn: "Retirada",
}

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  withdrawn: "bg-gray-100 text-gray-800",
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.user?.supplierId) redirect("/login")

  const processes = await getSupplierProcesses(session.user.supplierId)

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Portal do Fornecedor</h1>
          <p className="text-muted text-sm mt-1">
            {session.user.name} — {processes.length} processo(s) vinculado(s)
          </p>
        </div>
        <form action="/api/logout" method="POST">
          <button className="text-sm text-red-600 hover:underline">
            Sair
          </button>
        </form>
      </div>

      {processes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted">
            Nenhum processo vinculado ao seu fornecedor.
          </p>
          <p className="text-xs text-muted mt-2">
            Entre em contato com o órgão público para ser vinculado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {processes.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/${p.id}`}
              className="block rounded-lg border border-border bg-white p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-semibold text-lg truncate">
                    {p.title}
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    {p.number}/{p.year} — {p.organName}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Modalidade: {p.modality}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLOR[p.status] || ""}`}
                >
                  {STATUS_LABEL[p.status] || p.status}
                </span>
              </div>
              {p.proposalValue && (
                <p className="text-sm mt-3">
                  Proposta:{" "}
                  <span className="font-medium">
                    R$ {p.proposalValue}
                  </span>
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
