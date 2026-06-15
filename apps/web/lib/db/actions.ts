"use server"

import { revalidatePath } from "next/cache"
import { getSession, rateLimitByUser } from "@saas/auth"
import {
  createOrgan,
  deleteOrgan,
  createSupplier,
  deleteSupplier,
  createProcess,
  deleteProcess,
  advanceStage,
  updateOrgan,
  updateSupplier,
  getOrgans,
  getSuppliers,
  getProcesses,
  getOrganById,
  logActivity,
  createUser,
  updateUser,
  deleteUser,
  linkSupplierToProcess,
  unlinkSupplierFromProcess,
  updateProposalStatus,
} from "@/lib/db/queries"
import { sendEmail, newProcessEmail, stageAdvancedEmail, proposalStatusEmail } from "@/lib/email"
import { db, processSuppliers, suppliers, biddingProcesses } from "@saas/db"
import { eq } from "drizzle-orm"
import { organSchema, supplierSchema, processSchema, userSchema, emailSchema, passwordSchema, cnpjSchema } from "@saas/shared"
import { linkSupplierSchema, proposalStatusSchema, organUpdateSchema } from "@/lib/validation"

export type ActionResult = { error?: string; success?: boolean }

// ─── Organs ───────────────────────────────────────────────────────

export async function createOrganAction(form: FormData) {
  const parsed = organSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success)
    return { error: parsed.error.errors[0].message }

  const { name, cnpj, city, state } = parsed.data
  const slug = name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 100)

  try {
    await createOrgan({ name, cnpj, slug, city, state })
    revalidatePath("/dashboard/orgaos")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Erro ao criar órgão" }
  }
}

export async function deleteOrganAction(id: number) {
  await deleteOrgan(id)
  revalidatePath("/dashboard/orgaos")
}

// ─── Suppliers ────────────────────────────────────────────────────

export async function createSupplierAction(form: FormData) {
  const session = await getSession()
  if (!session?.user?.organId) return { error: "Não autenticado" }

  const parsed = supplierSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success)
    return { error: parsed.error.errors[0].message }

  const { companyName, cnpj, email, phone, city, state } = parsed.data

  try {
    await createSupplier({ organId: session.user.organId, companyName, cnpj, email: email || undefined, phone, city, state })
    revalidatePath("/dashboard/fornecedores")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Erro ao criar fornecedor" }
  }
}

export async function deleteSupplierAction(id: number) {
  const session = await getSession()
  if (!session?.user?.organId) return { error: "Não autenticado" }
  await deleteSupplier(id, session.user.organId)
  revalidatePath("/dashboard/fornecedores")
}

export async function updateSupplierStatusAction(
  id: number,
  status: "pending" | "qualified" | "disqualified"
) {
  const session = await getSession()
  if (!session?.user?.organId) return { error: "Não autenticado" }
  if (!["pending", "qualified", "disqualified"].includes(status))
    return { error: "Status inválido" }
  await updateSupplier(id, { status }, session.user.organId)
  revalidatePath("/dashboard/fornecedores")
}

// ─── Processes ────────────────────────────────────────────────────

export async function createProcessAction(form: FormData) {
  const session = await getSession()
  if (!session?.user?.id) return { error: "Não autenticado" }

  const parsed = processSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success)
    return { error: parsed.error.errors[0].message }

  const { title, modality, number, description, year } = parsed.data

  try {
    await createProcess({
      organId: session.user.organId,
      number,
      year,
      title,
      description,
      modality,
    })
    await logActivity({
      action: "create_process",
      details: `Processo ${number}/${year} criado`,
    })

    const modalities: Record<string,string> = {
      pregao: "Pregão", concorrencia: "Concorrência", tomada_precos: "Tomada de Preços",
      convite: "Convite", concurso: "Concurso", leilao: "Leilão",
      dispensa: "Dispensa", inexigibilidade: "Inexigibilidade",
    }
    if (session.user.email) {
      const msg = newProcessEmail(session.user.name || "Usuário", title, modalities[modality] || modality)
      await sendEmail({ to: session.user.email, ...msg })
    }

    revalidatePath("/dashboard/workflow")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Erro ao criar processo" }
  }
}

export async function deleteProcessAction(id: number) {
  await deleteProcess(id)
  revalidatePath("/dashboard/workflow")
}

export async function advanceStageAction(stageId: number) {
  const session = await getSession()
  if (!session?.user?.id) return { error: "Não autenticado" }

  try {
    const stage = await advanceStage(stageId)
    if (session.user.email && stage) {
      const processes = await getProcesses()
      const process = processes.find((p) =>
        p.stages?.some((s: any) => s.id === stageId)
      )
      if (process) {
        const stageMeta = process.stages?.find((s: any) => s.id === stageId)
        const msg = stageAdvancedEmail(
          session.user.name || "Usuário",
          process.title,
          stageMeta?.name || stage.name
        )
        await sendEmail({ to: session.user.email, ...msg })
      }
    }
  } catch (e: any) {
    return { error: e.message || "Erro ao avançar etapa" }
  }

  revalidatePath("/dashboard/workflow")
}

// ─── Users ─────────────────────────────────────────────────────────

export async function createUserAction(
  _prev: ActionResult | null,
  form: FormData
): Promise<ActionResult | null> {
  const session = await getSession()
  if (!session?.user?.organId) return { error: "Não autenticado" }

  if (!(await rateLimitByUser(session.user.id, 10, "60 s")))
    return { error: "Muitas tentativas. Aguarde um minuto." }

  const parsed = userSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success)
    return { error: parsed.error.errors[0].message }

  const { name, email, password } = parsed.data
  const role = parsed.data.role
  if (role === "supplier") return { error: "Role inválida" }

  try {
    await createUser({ name, email, password, role, organId: session.user.organId })
    revalidatePath("/dashboard/usuarios")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Erro ao criar usuário" }
  }
}

export async function updateUserAction(
  _prev: ActionResult | null,
  form: FormData
): Promise<ActionResult | null> {
  const id = parseInt(form.get("id") as string)
  const name = form.get("name") as string
  const email = form.get("email") as string
  const role = form.get("role") as string
  const active = form.get("active") === "true"

  if (!id) return { error: "ID inválido" }
  if (name && name.length < 1) return { error: "Nome é obrigatório" }
  if (email && !email.includes("@")) return { error: "Email inválido" }
  if (role && !["admin", "manager", "viewer", "supplier"].includes(role))
    return { error: "Role inválida" }

  try {
    await updateUser(id, {
      name: name || undefined,
      email: email || undefined,
      role: (role as any) || undefined,
      active,
    })
    revalidatePath("/dashboard/usuarios")
    return { success: true }
  } catch (e: any) {
    return { error: e.message || "Erro ao atualizar usuário" }
  }
}

export async function deleteUserAction(id: number) {
  const session = await getSession()
  if (!session?.user?.organId) return { error: "Não autenticado" }

  await deleteUser(id)
  revalidatePath("/dashboard/usuarios")
}

// ─── Process-Supplier Links ───────────────────────────────────────

export async function linkSupplierAction(form: FormData) {
  const session = await getSession()
  if (!session?.user?.organId) return { error: "Não autenticado" }

  const raw = {
    processId: form.get("processId"),
    supplierIds: form.getAll("supplierIds"),
  }
  const parsed = linkSupplierSchema.safeParse(raw)
  if (!parsed.success)
    return { error: parsed.error.errors[0].message }

  const { processId, supplierIds } = parsed.data

  await Promise.all(
    supplierIds.map((sid) => linkSupplierToProcess(processId, sid))
  )

  revalidatePath(`/dashboard/processos/${processId}`)
  return { success: true }
}

export async function unlinkSupplierAction(
  processId: number,
  supplierId: number
) {
  const session = await getSession()
  if (!session?.user?.organId) return { error: "Não autenticado" }

  await unlinkSupplierFromProcess(processId, supplierId)
  revalidatePath(`/dashboard/processos/${processId}`)
}

export async function updateProposalStatusAction(
  processSupplierId: number,
  status: "approved" | "rejected"
) {
  const session = await getSession()
  if (!session?.user?.organId) return { error: "Não autenticado" }

  const parsed = proposalStatusSchema.safeParse({ processSupplierId, status })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await updateProposalStatus(parsed.data.processSupplierId, parsed.data.status)

  // ── Notify supplier ──────────────────────────────────────────

  try {
    const rows = await db
      .select({
        supplierName: suppliers.companyName,
        supplierEmail: suppliers.email,
        processTitle: biddingProcesses.title,
      })
      .from(processSuppliers)
      .innerJoin(suppliers, eq(processSuppliers.supplierId, suppliers.id))
      .innerJoin(
        biddingProcesses,
        eq(processSuppliers.processId, biddingProcesses.id)
      )
      .where(eq(processSuppliers.id, processSupplierId))
      .limit(1)

    const row = rows[0]
    if (row?.supplierEmail) {
      const statusLabel = status === "approved" ? "Aprovada" : "Rejeitada"
      const msg = proposalStatusEmail(row.supplierName, row.processTitle, statusLabel)
      await sendEmail({ to: row.supplierEmail, ...msg })
    }
  } catch (e) {
    console.error("[email] Failed to notify supplier:", e)
  }

  revalidatePath("/dashboard/propostas")
  return { success: true }
}

// ─── Config ───────────────────────────────────────────────────────

export async function updateOrganConfigAction(form: FormData) {
  const parsed = organUpdateSchema.safeParse(Object.fromEntries(form))
  if (!parsed.success)
    return { error: parsed.error.errors[0].message }

  const { organId, name, address, city, state, phone } = parsed.data

  await updateOrgan(organId, { name, address, city, state, phone })
  revalidatePath("/dashboard/config")
  return { success: true }
}
