"use client"

import { useRouter } from "next/navigation"
import { updateOrganConfigAction } from "@/lib/db/actions"
import type { InferSelectModel } from "drizzle-orm"
import type { organs } from "@saas/db"

type Organ = InferSelectModel<typeof organs>

export function ConfigForm({
  organ,
  userEmail,
  userName,
}: {
  organ: Organ | null
  userEmail: string
  userName: string
}) {
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await updateOrganConfigAction(form)
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-white p-6 space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold mb-2">Perfil do Usuário</h2>
        <p className="text-sm text-muted mb-4">
          Seus dados de acesso.
        </p>
        <div className="grid gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              name="userName"
              defaultValue={userName}
              disabled
              className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="userEmail"
              defaultValue={userEmail}
              disabled
              className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h2 className="text-lg font-semibold mb-2">Perfil do Órgão</h2>
        <p className="text-sm text-muted mb-4">
          Informações cadastrais do seu órgão público.
        </p>
        {organ ? (
          <>
            <input type="hidden" name="organId" value={organ.id} />
            <div className="grid gap-4 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nome do Órgão
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={organ.name}
                  required
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input
                  type="text"
                  defaultValue={organ.cnpj}
                  disabled
                  className="w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  name="address"
                  defaultValue={organ.address || ""}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={organ.city || ""}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">UF</label>
                  <input
                    type="text"
                    name="state"
                    maxLength={2}
                    defaultValue={organ.state || ""}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Telefone
                </label>
                <input
                  type="text"
                  name="phone"
                  defaultValue={organ.phone || ""}
                  className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            Nenhum órgão vinculado à sua conta.
          </p>
        )}
      </div>

      {organ && (
        <div className="pt-2">
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Salvar alterações
          </button>
        </div>
      )}

      <hr className="border-gray-200" />

      <div>
        <h2 className="text-lg font-semibold mb-2">Notificações</h2>
        <p className="text-sm text-muted mb-4">
          Configure alertas de prazos e eventos.
        </p>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            defaultChecked
            className="rounded border-gray-300"
          />
          <span className="text-sm">
            Receber alertas de prazos críticos
          </span>
        </label>
      </div>
    </form>
  )
}
