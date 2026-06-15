"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter } from "lucide-react"

const modalities = [
  { value: "all", label: "Todas" },
  { value: "pregao", label: "Pregão" },
  { value: "concorrencia", label: "Concorrência" },
  { value: "tomada_precos", label: "Tomada de Preços" },
  { value: "convite", label: "Convite" },
  { value: "concurso", label: "Concurso" },
  { value: "leilao", label: "Leilão" },
  { value: "dispensa", label: "Dispensa" },
  { value: "inexigibilidade", label: "Inexigibilidade" },
]

export function ProcessSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get("search") || ""
  const currentModality = searchParams.get("modality") || "all"
  const currentActive = searchParams.get("active") || "all"

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "all") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard/workflow?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted" />
        <input
          type="text"
          placeholder="Buscar por título ou número..."
          defaultValue={currentSearch}
          onChange={(e) => {
            const timer = setTimeout(() => applyFilter("search", e.target.value), 300)
            return () => clearTimeout(timer)
          }}
          className="w-full h-10 rounded-lg border border-border bg-white pl-9 pr-3 text-sm"
        />
      </div>
      <select
        value={currentModality}
        onChange={(e) => applyFilter("modality", e.target.value)}
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm"
      >
        {modalities.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
      <select
        value={currentActive}
        onChange={(e) => applyFilter("active", e.target.value)}
        className="h-10 rounded-lg border border-border bg-white px-3 text-sm"
      >
        <option value="all">Todos</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
    </div>
  )
}
