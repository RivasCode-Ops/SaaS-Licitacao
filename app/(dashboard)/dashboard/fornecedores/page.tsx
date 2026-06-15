import { getSession } from "@/lib/auth/session"
import { getSuppliers } from "@/lib/db/queries"
import { Users } from "lucide-react"
import {
  CreateSupplierForm,
  DeleteSupplierButton,
  SupplierStatusBadge,
} from "./suppliers-form"

export const dynamic = "force-dynamic"

export default async function FornecedoresPage() {
  const session = await getSession()
  const suppliers = await getSuppliers(session?.user?.organId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fornecedores</h1>
        <CreateSupplierForm />
      </div>

      {suppliers.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <Users className="size-12 text-muted mx-auto mb-4" />
          <p className="text-muted">Nenhum fornecedor cadastrado.</p>
          <p className="text-sm text-muted mt-1">
            Cadastre fornecedores para participar dos processos.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-border bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Users className="size-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{s.companyName}</h3>
                    <p className="text-sm text-muted">
                      CNPJ: {s.cnpj}
                      {s.city && ` — ${s.city}/${s.state}`}
                    </p>
                    {s.email && (
                      <p className="text-xs text-muted">{s.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SupplierStatusBadge id={s.id} status={s.status} />
                  <DeleteSupplierButton id={s.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
