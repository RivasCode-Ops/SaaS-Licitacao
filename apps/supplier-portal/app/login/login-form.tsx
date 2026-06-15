"use client"

import { useActionState } from "react"
import { loginAction } from "./actions"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(loginAction, {})

  useEffect(() => {
    if (state.success) router.push("/dashboard")
  }, [state.success, router])

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded">
          {state.error}
        </p>
      )}
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        className="w-full h-10 rounded border border-border px-3 text-sm"
      />
      <input
        name="password"
        type="password"
        placeholder="Senha"
        required
        className="w-full h-10 rounded border border-border px-3 text-sm"
      />
      <button
        type="submit"
        className="w-full h-10 bg-primary text-white rounded text-sm font-medium"
      >
        Entrar
      </button>
    </form>
  )
}
