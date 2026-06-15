import { db } from "./drizzle"
import { biddingProcesses, processStages, suppliers, activityLogs, organs } from "./schema"
import { count, eq, desc, sql, and, lt, isNotNull } from "drizzle-orm"
import { getStagesForModality, calculateDeadline } from "@/lib/workflow/rules"

export async function getDashboardStats() {
  const [processResult] = await db
    .select({ total: count() })
    .from(biddingProcesses)
  const [activeResult] = await db
    .select({ total: count() })
    .from(biddingProcesses)
    .where(eq(biddingProcesses.active, true))
  const [supplierResult] = await db
    .select({ total: count() })
    .from(suppliers)
  const [organResult] = await db
    .select({ total: count() })
    .from(organs)

  return {
    totalProcesses: Number(processResult.total),
    activeProcesses: Number(activeResult.total),
    totalSuppliers: Number(supplierResult.total),
    totalOrgans: Number(organResult.total),
  }
}

export async function getProcessesByModality() {
  const rows = await db
    .select({
      modality: biddingProcesses.modality,
      total: count(),
    })
    .from(biddingProcesses)
    .groupBy(biddingProcesses.modality)
    .orderBy(biddingProcesses.modality)

  const labels: Record<string, string> = {
    pregao: "Pregão",
    concorrencia: "Concorrência",
    tomada_precos: "Tomada de Preços",
    convite: "Convite",
    concurso: "Concurso",
    leilao: "Leilão",
    dispensa: "Dispensa",
    inexigibilidade: "Inexigibilidade",
  }

  return rows.map((r) => ({
    name: labels[r.modality] || r.modality,
    value: Number(r.total),
  }))
}

export async function getSuppliersByStatus() {
  const rows = await db
    .select({
      status: suppliers.status,
      total: count(),
    })
    .from(suppliers)
    .groupBy(suppliers.status)

  const labels: Record<string, string> = {
    pending: "Pendente",
    qualified: "Qualificado",
    disqualified: "Desqualificado",
  }

  return rows.map((r) => ({
    name: labels[r.status] || r.status,
    value: Number(r.total),
  }))
}

export async function getUpcomingDeadlines() {
  const activeStages = await db
    .select({
      id: processStages.id,
      name: processStages.name,
      startedAt: processStages.startedAt,
      processId: processStages.processId,
      processTitle: biddingProcesses.title,
      processModality: biddingProcesses.modality,
    })
    .from(processStages)
    .innerJoin(
      biddingProcesses,
      eq(processStages.processId, biddingProcesses.id)
    )
    .where(
      and(
        eq(processStages.status, "active"),
        isNotNull(processStages.startedAt)
      )
    )

  const now = new Date()
  const deadlines = activeStages
    .map((s) => {
      const rules = getStagesForModality(s.processModality)
      const rule = rules.find((r) => r.name === s.name)
      if (!rule || !s.startedAt) return null
      const deadline = calculateDeadline(s.startedAt, rule.deadlineDays)
      const diffMs = deadline.getTime() - now.getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return {
        id: s.id,
        stage: s.name,
        process: s.processTitle,
        deadline: deadline.toLocaleDateString("pt-BR"),
        remainingDays: diffDays,
        overdue: diffDays < 0,
      }
    })
    .filter(Boolean)
    .sort((a, b) => a!.remainingDays - b!.remainingDays)
    .slice(0, 10)

  return deadlines
}

export async function getRecentActivity() {
  return db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      details: activityLogs.details,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .orderBy(desc(activityLogs.createdAt))
    .limit(10)
}
