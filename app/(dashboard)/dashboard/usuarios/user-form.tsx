"use client"

import { useActionState } from "react"
import { createUserAction, updateUserAction, deleteUserAction } from "@/lib/db/actions"
import { UserCog, ShieldCheck, Shield, Eye, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  manager: "Gerente",
  viewer: "Visualizador",
}

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, null)

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        type="text"
        name="name"
        placeholder="Nome"
        className="h-9 rounded-lg border border-border bg-white px-3 text-sm w-36"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="h-9 rounded-lg border border-border bg-white px-3 text-sm w-44"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Senha"
        className="h-9 rounded-lg border border-border bg-white px-3 text-sm w-32"
        required
      />
      <select
        name="role"
        className="h-9 rounded-lg border border-border bg-white px-3 text-sm"
        defaultValue="viewer"
      >
        <option value="admin">Admin</option>
        <option value="manager">Gerente</option>
        <option value="viewer">Visualizador</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Criando..." : "Criar"}
      </button>
      {state?.error && <span className="text-xs text-red-500">{state.error}</span>}
      {state?.success && <span className="text-xs text-green-600">Usuário criado!</span>}
    </form>
  )
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    manager: "bg-blue-100 text-blue-700",
    viewer: "bg-gray-100 text-gray-600",
  }
  const icons: Record<string, React.ReactNode> = {
    admin: <ShieldCheck className="size-3.5" />,
    manager: <Shield className="size-3.5" />,
    viewer: <Eye className="size-3.5" />,
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[role] || colors.viewer}`}>
      {icons[role]}
      {roleLabels[role] || role}
    </span>
  )
}

export function UserList({ user }: { user: any }) {
  const router = useRouter()
  const [editState, editAction, editPending] = useActionState(updateUserAction, null)

  const handleDelete = async () => {
    if (confirm("Remover este usuário?")) {
      await deleteUserAction(user.id)
      router.refresh()
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <UserCog className="size-5 text-primary mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{user.name}</h3>
              <RoleBadge role={user.role} />
              {!user.active && (
                <span className="text-xs text-red-500 font-medium">Inativo</span>
              )}
            </div>
            <p className="text-sm text-muted">{user.email}</p>
            <p className="text-xs text-muted mt-1">
              Criado em {new Date(user.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <form action={editAction}>
            <input type="hidden" name="id" value={user.id} />
            <input type="hidden" name="name" value={user.name} />
            <input type="hidden" name="email" value={user.email} />
            <select
              name="role"
              className="h-8 rounded-lg border border-border bg-white px-2 text-xs"
              defaultValue={user.role}
            >
              <option value="admin">Admin</option>
              <option value="manager">Gerente</option>
              <option value="viewer">Visualizador</option>
            </select>
            <input type="hidden" name="active" value={user.active ? "true" : "false"} />
            <button
              type="submit"
              disabled={editPending}
              className="ml-1 h-8 rounded-lg bg-gray-100 px-3 text-xs font-medium hover:bg-gray-200"
            >
              Salvar
            </button>
          </form>
          <button
            onClick={handleDelete}
            className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      {editState?.error && (
        <p className="text-xs text-red-500 mt-2">{editState.error}</p>
      )}
    </div>
  )
}
