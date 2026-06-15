import Link from "next/link"
import { ArrowRight, FileText, Shield, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">SaaS Licitação</span>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted hover:text-foreground transition-colors">
              Preços
            </Link>
            <Link
              href="/login/sign-in"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/login/sign-up"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Começar <ArrowRight className="size-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              Licitações públicas simplificadas
            </h1>
            <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
              Plataforma completa para gestão de processos licitatórios.
              Do edital ao contrato, em um só lugar.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/login/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
              >
                Começar grátis <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-foreground hover:bg-gray-50 transition-colors"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-xl border border-border bg-background">
                <FileText className="size-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Gestão de Editais</h3>
                <p className="text-sm text-muted">
                  Crie e gerencie editais completos com templates padronizados
                  e conformidade legal.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-background">
                <Zap className="size-8 text-secondary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Workflow Automatizado</h3>
                <p className="text-sm text-muted">
                  Fluxo de aprovações, prazos, recursos e homologação
                  automatizados.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-border bg-background">
                <Shield className="size-8 text-success mb-4" />
                <h3 className="text-lg font-semibold mb-2">Transparência Total</h3>
                <p className="text-sm text-muted">
                  Publicação integrada em diários oficiais e portal de
                  transparência.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} SaaS Licitação. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}
