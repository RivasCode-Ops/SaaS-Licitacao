import { getOrgans } from "@/lib/db/queries"
import { Building2 } from "lucide-react"
import { CreateOrganForm, DeleteOrganButton } from "./organs-form"

export const dynamic = "force-dynamic"

export default async function OrgaosPage() {
  const organs = await getOrgans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Órgãos</h1>
        <CreateOrganForm />
      </div>

      {organs.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <Building2 className="size-12 text-muted mx-auto mb-4" />
          <p className="text-muted">Nenhum órgão cadastrado.</p>
          <p className="text-sm text-muted mt-1">
            Crie o primeiro órgão para começar.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {organs.map((organ) => (
            <div
              key={organ.id}
              className="rounded-xl border border-border bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Building2 className="size-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">{organ.name}</h3>
                    <p className="text-sm text-muted">
                      CNPJ: {organ.cnpj}
                      {organ.city && ` — ${organ.city}/${organ.state}`}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {organ.processes?.length || 0} processos ·{" "}
                      {organ.users?.length || 0} usuário(s)
                    </p>
                  </div>
                </div>
                <DeleteOrganButton id={organ.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
