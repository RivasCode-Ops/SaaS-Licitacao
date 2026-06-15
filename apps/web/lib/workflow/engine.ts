import { db, biddingProcesses, processStages, activityLogs } from "@saas/db"
import { eq, and, desc } from "drizzle-orm"
import { getStagesForModality, calculateDeadline } from "./rules"

export type StageStatus = "pending" | "active" | "completed" | "cancelled"

export type ProcessInfo = {
  id: number
  modality: string
  openingDate: Date | null
  stages: {
    id: number
    name: string
    order: number
    status: StageStatus
    startedAt: Date | null
    completedAt: Date | null
  }[]
}

export async function getProcessState(processId: number): Promise<ProcessInfo | null> {
  const process = await db.query.biddingProcesses.findFirst({
    where: eq(biddingProcesses.id, processId),
    with: { stages: true },
  })
  if (!process) return null

  return {
    id: process.id,
    modality: process.modality,
    openingDate: process.openingDate,
    stages: process.stages.map((s) => ({
      id: s.id,
      name: s.name,
      order: s.order,
      status: s.status as StageStatus,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
    })),
  }
}

export async function canAdvanceStage(stageId: number): Promise<{
  allowed: boolean
  reason?: string
}> {
  const [stage] = await db
    .select()
    .from(processStages)
    .where(eq(processStages.id, stageId))
    .limit(1)

  if (!stage) return { allowed: false, reason: "Etapa não encontrada" }
  if (stage.status !== "active")
    return { allowed: false, reason: "Etapa não está ativa" }

  const process = await db.query.biddingProcesses.findFirst({
    where: eq(biddingProcesses.id, stage.processId),
  })
  if (!process) return { allowed: false, reason: "Processo não encontrado" }

  const rules = getStagesForModality(process.modality)
  const rule = rules.find((r) => r.order === stage.order)
  if (!rule) return { allowed: true }

  if (stage.startedAt && !rule.canAutoAdvance) {
    return {
      allowed: false,
      reason: `Etapa "${stage.name}" requer ação manual`,
    }
  }

  return { allowed: true }
}

export async function advanceStageWithRules(stageId: number) {
  const check = await canAdvanceStage(stageId)
  if (!check.allowed) {
    throw new Error(check.reason || "Não é possível avançar esta etapa")
  }

  const [stage] = await db
    .update(processStages)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(processStages.id, stageId))
    .returning()

  if (!stage) throw new Error("Etapa não encontrada")

  const [nextStage] = await db
    .select()
    .from(processStages)
    .where(
      and(
        eq(processStages.processId, stage.processId),
        eq(processStages.order, stage.order + 1)
      )
    )
    .limit(1)

  if (nextStage) {
    await db
      .update(processStages)
      .set({ status: "active", startedAt: new Date() })
      .where(eq(processStages.id, nextStage.id))

    const process = await db.query.biddingProcesses.findFirst({
      where: eq(biddingProcesses.id, stage.processId),
    })

    if (process) {
      const rules = getStagesForModality(process.modality)
      const nextRule = rules.find((r) => r.order === nextStage.order)
      if (nextRule) {
        const deadline = calculateDeadline(new Date(), nextRule.deadlineDays)
        await db
          .update(processStages)
          .set({ notes: `Prazo limite: ${deadline.toLocaleDateString("pt-BR")}` })
          .where(eq(processStages.id, nextStage.id))
      }
    }
  }

  return stage
}

export async function checkOverdueStages(): Promise<number> {
  const activeStages = await db
    .select()
    .from(processStages)
    .where(eq(processStages.status, "active"))

  let advanced = 0

  for (const stage of activeStages) {
    const process = await db.query.biddingProcesses.findFirst({
      where: eq(biddingProcesses.id, stage.processId),
    })
    if (!process) continue

    const rules = getStagesForModality(process.modality)
    const rule = rules.find((r) => r.order === stage.order)
    if (!rule || !rule.canAutoAdvance || !stage.startedAt) continue

    const deadline = calculateDeadline(stage.startedAt, rule.deadlineDays)
    if (new Date() > deadline) {
      try {
        await advanceStageWithRules(stage.id)
        await db.insert(activityLogs).values({
          processId: stage.processId,
          action: "auto_advance",
          details: `Etapa "${stage.name}" avançada automaticamente (prazo vencido)`,
        })
        advanced++
      } catch {}
    }
  }

  return advanced
}
