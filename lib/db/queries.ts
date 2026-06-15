import { eq, and, desc, sql, InferSelectModel } from "drizzle-orm"
import { db } from "./drizzle"
import {
  users,
  organs,
  suppliers,
  biddingProcesses,
  processStages,
  activityLogs,
} from "./schema"
import { hashPassword } from "../auth/session"
import { getStagesForModality, calculateDeadline } from "../workflow/rules"
import { advanceStageWithRules } from "../workflow/engine"

// ─── Users ────────────────────────────────────────────────────────

export async function createUser(data: {
  name: string
  email: string
  password: string
  role?: "admin" | "manager" | "viewer"
  organId?: number
}) {
  const { password, ...rest } = data
  const passwordHash = await hashPassword(password)
  const [user] = await db
    .insert(users)
    .values({ ...rest, passwordHash })
    .returning()
  return user
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
    with: { organ: true },
  })
}

export async function getUserById(id: number) {
  return db.query.users.findFirst({
    where: eq(users.id, id),
    with: { organ: true },
  })
}

export type UserWithOrgan = InferSelectModel<typeof users> & {
  organ?: InferSelectModel<typeof organs> | null
}

export async function getUsersByOrgan(organId: number) {
  return db.query.users.findMany({
    where: eq(users.organId, organId),
    orderBy: desc(users.createdAt),
  })
}

export async function updateUser(
  id: number,
  data: Partial<{
    name: string
    email: string
    role: "admin" | "manager" | "viewer"
    active: boolean
  }>
) {
  const [user] = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning()
  return user
}

export async function deleteUser(id: number) {
  await db.delete(users).where(eq(users.id, id))
}

// ─── Organs ───────────────────────────────────────────────────────

export async function createOrgan(data: {
  name: string
  cnpj: string
  slug: string
  address?: string
  city?: string
  state?: string
  phone?: string
}) {
  const [organ] = await db.insert(organs).values(data).returning()
  return organ
}

export async function getOrgans() {
  return db.query.organs.findMany({
    orderBy: desc(organs.createdAt),
    with: { users: true, processes: true },
  })
}

export async function getOrganBySlug(slug: string) {
  return db.query.organs.findFirst({
    where: eq(organs.slug, slug),
    with: { users: true },
  })
}

export async function getOrganById(id: number) {
  return db.query.organs.findFirst({
    where: eq(organs.id, id),
    with: { users: true, processes: true },
  })
}

export async function updateOrgan(
  id: number,
  data: Partial<{
    name: string
    address: string
    city: string
    state: string
    phone: string
  }>
) {
  const [organ] = await db
    .update(organs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(organs.id, id))
    .returning()
  return organ
}

export async function deleteOrgan(id: number) {
  await db.delete(organs).where(eq(organs.id, id))
}

// ─── Suppliers ────────────────────────────────────────────────────

export async function createSupplier(data: {
  organId: number
  companyName: string
  cnpj: string
  tradeName?: string
  email?: string
  phone?: string
  city?: string
  state?: string
  status?: "pending" | "qualified" | "disqualified"
}) {
  const [supplier] = await db.insert(suppliers).values(data).returning()
  return supplier
}

export async function getSuppliers(organId?: number) {
  const where = organId ? eq(suppliers.organId, organId) : undefined
  return db.query.suppliers.findMany({
    where,
    orderBy: desc(suppliers.updatedAt),
  })
}

export async function getSupplierById(id: number) {
  return db.query.suppliers.findFirst({
    where: eq(suppliers.id, id),
  })
}

export async function updateSupplier(
  id: number,
  data: Partial<{
    companyName: string
    tradeName: string
    email: string
    phone: string
    city: string
    state: string
    status: "pending" | "qualified" | "disqualified"
  }>,
  organId?: number
) {
  const where = organId ? and(eq(suppliers.id, id), eq(suppliers.organId, organId)) : eq(suppliers.id, id)
  const [supplier] = await db
    .update(suppliers)
    .set({ ...data, updatedAt: new Date() })
    .where(where)
    .returning()
  return supplier
}

export async function deleteSupplier(id: number, organId?: number) {
  const where = organId ? and(eq(suppliers.id, id), eq(suppliers.organId, organId)) : eq(suppliers.id, id)
  await db.delete(suppliers).where(where)
}

// ─── Bidding Processes ────────────────────────────────────────────

export async function getProcesses() {
  return db.query.biddingProcesses.findMany({
    orderBy: desc(biddingProcesses.createdAt),
    with: { stages: true, organ: true },
  })
}

export async function getProcessesByOrgan(
  organId: number,
  filters?: {
    search?: string
    modality?: string
    active?: boolean
  }
) {
  const conditions = [eq(biddingProcesses.organId, organId)]

  if (filters?.search) {
    conditions.push(
      sql`(${biddingProcesses.title} ILIKE ${`%${filters.search}%`} OR ${biddingProcesses.number} ILIKE ${`%${filters.search}%`})`
    )
  }

  if (filters?.modality && filters.modality !== "all") {
    conditions.push(eq(biddingProcesses.modality, filters.modality as any))
  }

  if (filters?.active !== undefined) {
    conditions.push(eq(biddingProcesses.active, filters.active))
  }

  return db.query.biddingProcesses.findMany({
    where: and(...conditions),
    orderBy: desc(biddingProcesses.createdAt),
    with: { stages: true },
  })
}

export async function getProcessWithStages(processId: number) {
  return db.query.biddingProcesses.findFirst({
    where: eq(biddingProcesses.id, processId),
    with: { stages: true, documents: true },
  })
}

export async function createProcess(data: {
  organId: number
  number: string
  year: number
  title: string
  description?: string
  modality: string
}) {
  const [process] = await db
    .insert(biddingProcesses)
    .values(data as any)
    .returning()

  const stages = getStagesForModality(data.modality)

  for (const stage of stages) {
    const now = stage.order === 1 ? new Date() : null
    const deadline = stage.order === 1 && stage.deadlineDays
      ? calculateDeadline(new Date(), stage.deadlineDays)
      : null
    await db.insert(processStages).values({
      processId: process.id,
      name: stage.name,
      order: stage.order,
      status: stage.order === 1 ? "active" : "pending",
      startedAt: stage.order === 1 ? now : null,
      notes: deadline ? `Prazo limite: ${deadline.toLocaleDateString("pt-BR")}` : null,
    })
  }

  return getProcessWithStages(process.id)
}

export async function deleteProcess(id: number) {
  await db.delete(biddingProcesses).where(eq(biddingProcesses.id, id))
}

// ─── Stages ───────────────────────────────────────────────────────

export async function advanceStage(stageId: number) {
  return advanceStageWithRules(stageId)
}

// ─── Activity Logs ────────────────────────────────────────────────

export async function logActivity(data: {
  userId?: number
  organId?: number
  processId?: number
  action: string
  details?: string
}) {
  const [log] = await db.insert(activityLogs).values(data).returning()
  return log
}
