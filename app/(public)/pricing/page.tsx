import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Básico",
    price: "R$ 0",
    period: "grátis",
    description: "Para testes e pequenos órgãos",
    features: [
      "Até 3 processos simultâneos",
      "Gestão básica de editais",
      "Workflow padrão",
      "Suporte por email",
    ],
  },
  {
    name: "Profissional",
    price: "R$ 197",
    period: "/mês",
    description: "Para órgãos em crescimento",
    features: [
      "Processos ilimitados",
      "Workflow avançado com recursos",
      "Publicação em diário oficial",
      "Relatórios e dashboards",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Sob consulta",
    period: "",
    description: "Para secretarias e governos estaduais",
    features: [
      "Tudo do Profissional",
      "Multissecretarias",
      "API dedicada",
      "SLA garantido",
      "Suporte 24/7 dedicado",
      "Treinamento da equipe",
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="text-xl font-bold text-primary">
            SaaS Licitação
          </Link>
        </div>
      </header>

      <main className="flex-1 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold">Planos e Preços</h1>
            <p className="mt-4 text-muted">
              Escolha o plano ideal para seu órgão público
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-8 ${
                  plan.highlighted
                    ? "border-primary bg-primary text-white shadow-lg scale-105"
                    : "border-border bg-white"
                }`}
              >
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-4 mb-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span
                      className={`text-sm ml-1 ${
                        plan.highlighted ? "text-white/80" : "text-muted"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mt-2 ${
                    plan.highlighted ? "text-white/80" : "text-muted"
                  }`}
                >
                  {plan.description}
                </p>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check
                        className={`size-4 mt-0.5 shrink-0 ${
                          plan.highlighted ? "text-white" : "text-success"
                        }`}
                      />
                      <span
                        className={
                          plan.highlighted ? "text-white/90" : "text-muted"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login/sign-up"
                  className={`mt-8 block w-full text-center rounded-lg py-3 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-white text-primary hover:bg-gray-100"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {plan.price === "Sob consulta"
                    ? "Falar conosco"
                    : "Começar grátis"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
