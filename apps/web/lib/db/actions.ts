"use server"

import { revalidatePath } from "next/cache"
import { getSession } from "@saas/auth"
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
} from "@/lib/db/queries"
import { sendEmail, newProcessEmail, stageAdvancedEmail } from "@/lib/email"

export type ActionResult = { error?: string; success?: boolean }

// ─── Organs ───────────────────────────────────────────────────────

export async function createOrganAction(form: FormData) {
  const name = form.get("name") as string
  const cnpj = form.get("cnpj") as string
  const city = form.get("city") as string
  const state = form.get("state") as string

  if (!name || !cnpj) return { error: "Nome e CNPJ são obrigatórios" }

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

  const companyName = form.get("companyName") as string
  const cnpj = form.get("cnpj") as string
  const email = form.get("email") as string
  const phone = form.get("phone") as string
  const city = form.get("city") as string
  const state = form.get("state") as string

  if (!companyName || !cnpj) return { error: "Nome e CNPJ são obrigatórios" }

  try {
    await createSupplier({ organId: session.user.organId, companyName, cnpj, email, phone, city, state })
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
  await updateSupplier(id, { status }, session.user.organId)
  revalidatePath("/dashboard/fornecedores")
}

// ─── Processes ────────────────────────────────────────────────────

export async function createProcessAction(form: FormData) {
  const session = await getSession()
  if (!session?.user?.id) return { error: "Não autenticado" }

  const title = form.get("title") as string
  const modality = form.get("modality") as string
  const number = form.get("number") as string
  const description = form.get("description") as string
  const year = parseInt(form.get("year") as string) || new Date().getFullYear()

  if (!title || !modality || !number)
    return { error: "Preencha todos os campos obrigatórios" }

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

  const name = form.get("name") as string
  const email = form.get("email") as string
  const password = form.get("password") as string
  const role = form.get("role") as "admin" | "manager" | "viewer" | null

  if (!name || !email || !password) return { error: "Preencha todos os campos" }

  try {
    await createUser({ name, email, password, role: role || "viewer", organId: session.user.organId })
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
  const role = form.get("role") as "admin" | "manager" | "viewer" | null
  const active = form.get("active") === "true"

  if (!id) return { error: "ID inválido" }

  try {
    await updateUser(id, { name, email, role: role || "viewer", active })
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

// ─── Config ───────────────────────────────────────────────────────

export async function updateOrganConfigAction(form: FormData) {
  const organId = parseInt(form.get("organId") as string)
  const name = form.get("name") as string
  const address = form.get("address") as string
  const city = form.get("city") as string
  const state = form.get("state") as string
  const phone = form.get("phone") as string

  if (!organId || !name) return { error: "Nome é obrigatório" }

  await updateOrgan(organId, { name, address, city, state, phone })
  revalidatePath("/dashboard/config")
  return { success: true }
}
