import { getSession } from "@saas/auth"
import { getUsersByOrgan } from "@/lib/db/queries"
import { UserCog } from "lucide-react"
import { UserList, CreateUserForm } from "./user-form"

export const dynamic = "force-dynamic"

export default async function UsuariosPage() {
  const session = await getSession()
  if (!session?.user?.organId) return null

  const users = await getUsersByOrgan(session.user.organId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <CreateUserForm />
      </div>

      {users.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center">
          <UserCog className="size-12 text-muted mx-auto mb-4" />
          <p className="text-muted">Nenhum usuário cadastrado.</p>
          <p className="text-sm text-muted mt-1">
            Crie usuários para gerenciar o acesso ao sistema.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <UserList key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  )
}
