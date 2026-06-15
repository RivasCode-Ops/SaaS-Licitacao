import { Suspense } from "react"
import { LoginForm } from "../login-form"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-sm text-muted mt-1">
            Comece a usar o SaaS Licitação
          </p>
        </div>
        <Suspense>
          <LoginForm mode="signup" />
        </Suspense>
      </div>
    </div>
  )
}
