import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Portal do Fornecedor</h1>
          <p className="text-sm text-muted mt-1">Faça login para continuar</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
