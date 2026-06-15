import { Suspense } from "react"
import { LoginForm } from "../login-form"

export default async function SignInPage(props: {
  searchParams?: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="text-sm text-muted mt-1">
            Acesse sua conta SaaS Licitação
          </p>
        </div>
        <Suspense>
          <LoginForm mode="signin" oauthError={searchParams?.error} />
        </Suspense>
      </div>
    </div>
  )
}
