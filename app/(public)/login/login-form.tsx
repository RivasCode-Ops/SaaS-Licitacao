"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { signInAction, signUpAction, type ActionState } from "./actions"

export function LoginForm({ mode }: { mode: "signin" | "signup" }) {
  const router = useRouter()
  const action = mode === "signin" ? signInAction : signUpAction
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    action,
    {}
  )

  if (state?.success) {
    router.push("/dashboard")
  }

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Seu nome completo"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="seu@email.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        {mode === "signin" ? "Entrar" : "Criar conta"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "signin" ? (
          <>
            Não tem conta?{" "}
            <Link
              href="/login/sign-up"
              className="text-primary hover:underline"
            >
              Cadastre-se
            </Link>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <Link
              href="/login/sign-in"
              className="text-primary hover:underline"
            >
              Entrar
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
