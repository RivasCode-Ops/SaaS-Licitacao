import { getSession } from "@/lib/auth/session"
import { db } from "@/lib/db/drizzle"
import { biddingProcesses, activityLogs } from "@/lib/db/schema"
import { count, desc, eq } from "drizzle-orm"
import {
  FileText,
  Users,
  Building2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.user?.id) return null

  const organId = session.user.id

  const [processCount] = await db
    .select({ count: count() })
    .from(biddingProcesses)
  const activeProcesses = processCount.count

  const logs = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(10)

  const stats = [
    { label: "Processos Ativos", value: String(activeProcesses), icon: FileText, color: "text-primary" },
    { label: "Fornecedores", value: "0", icon: Users, color: "text-success" },
    { label: "Órgãos", value: "1", icon: Building2, color: "text-secondary" },
    { label: "Atividades", value: String(logs.length), icon: AlertCircle, color: "text-danger" },
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
                <span className="text-sm">{log.action}</span>
                <span className="text-xs text-muted">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
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
