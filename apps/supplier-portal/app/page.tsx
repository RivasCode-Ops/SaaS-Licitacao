import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Portal do Fornecedor</h1>
      <p className="text-muted mb-8 text-center">
        Acompanhe seus processos licitatórios
      </p>
      <Link
        href="/login"
        className="bg-primary text-white px-6 py-2 rounded-lg text-sm"
      >
        Acessar
      </Link>
    </main>
  )
}
