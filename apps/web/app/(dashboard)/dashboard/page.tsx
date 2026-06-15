import { getSession } from "@saas/auth"
import { db, biddingProcesses } from "@saas/db"
import { count, eq, and } from "drizzle-orm"
import { FileText, Users, Building2, Activity } from "lucide-react"
import Link from "next/link"
import {
  getProcessesByModality,
  getSuppliersByStatus,
  getUpcomingDeadlines,
  getRecentActivity,
} from "@/lib/db/dashboard-queries"
import { ModalityChart } from "@/components/dashboard/modality-chart"
import { SuppliersChart } from "@/components/dashboard/suppliers-chart"
import { DeadlinesList } from "@/components/dashboard/deadlines-list"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const organId = session.user.organId

  const [processResult] = await db
    .select({ count: count() })
    .from(biddingProcesses)
    .where(eq(biddingProcesses.organId, organId))
  const [activeResult] = await db
    .select({ count: count() })
    .from(biddingProcesses)
    .where(and(eq(biddingProcesses.active, true), eq(biddingProcesses.organId, organId)))

  const [modalityData, suppliersData, deadlines, logs] = await Promise.all([
    getProcessesByModality(organId),
    getSuppliersByStatus(organId),
    getUpcomingDeadlines(organId),
    getRecentActivity(organId),
  ])

  const stats = [
    { label: "Processos", value: String(processResult.count), icon: FileText, color: "text-primary" },
    { label: "Ativos", value: String(activeResult.count), icon: Activity, color: "text-green-600" },
    { label: "Fornecedores", value: String(suppliersData.reduce((a, b) => a + b.value, 0)), icon: Users, color: "text-amber-600" },
    { label: "Etapas com prazo", value: String(deadlines.filter(Boolean).length), icon: Building2, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Visão Geral</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-white p-6">
            <div className="flex items-center justify-between">
              <stat.icon className={`size-8 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold mt-4">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Processos por Modalidade</h2>
          <ModalityChart data={modalityData} />
        </div>

        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Fornecedores por Status</h2>
          <SuppliersChart data={suppliersData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Próximos Prazos</h2>
          <DeadlinesList deadlines={deadlines} />
        </div>

        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="text-lg font-semibold mb-4">Atividades Recentes</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">
              Nenhuma atividade registrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm">{log.details || log.action}</span>
                  <span className="text-xs text-muted shrink-0 ml-4">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/dashboard/workflow"
          className="text-sm text-primary hover:underline"
        >
          Ver workflow de licitações →
        </Link>
      </div>
    </div>
  )
}
