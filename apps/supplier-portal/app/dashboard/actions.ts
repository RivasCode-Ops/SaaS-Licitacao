"use server"

import { getSession, rateLimitByUser } from "@saas/auth"
import { db, processSuppliers, biddingProcesses, users, suppliers } from "@saas/db"
import { eq, and, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { saveFile, inngest } from "@saas/shared"
import { submitProposalSchema } from "@/lib/validation"

export type ActionState = {
  error?: string
  success?: boolean
}

export async function submitProposalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession()
  if (!session?.user?.supplierId) return { error: "Acesso negado" }

  if (!(await rateLimitByUser(session.user.id, 10, "60 s")))
    return { error: "Muitas tentativas. Aguarde um minuto." }

  const raw = {
    processId: formData.get("processId"),
    proposalValue: formData.get("proposalValue"),
  }
  const parsed = submitProposalSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { processId, proposalValue } = parsed.data
  const file = formData.get("proposalFile") as File | null

  const link = await db.query.processSuppliers.findFirst({
    where: and(
      eq(processSuppliers.processId, processId),
      eq(processSuppliers.supplierId, session.user.supplierId)
    ),
  })

  if (!link) return { error: "Vínculo não encontrado" }

  if (file && file.size > 10 * 1024 * 1024)
    return { error: "Arquivo deve ter no máximo 10MB" }

  const updateData: any = { proposalValue, updatedAt: new Date() }
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer())
    updateData.proposalFile = await saveFile(file.name, buffer)
  }

  await db
    .update(processSuppliers)
    .set(updateData)
    .where(eq(processSuppliers.id, link.id))

  // ── Notify admins/managers of the organ ──────────────────────

  try {
    const [process] = await db
      .select({ title: biddingProcesses.title, organId: biddingProcesses.organId })
      .from(biddingProcesses)
      .where(eq(biddingProcesses.id, processId))
      .limit(1)

    const [supplier] = await db
      .select({
        companyName: suppliers.companyName,
        email: suppliers.email,
      })
      .from(suppliers)
      .where(eq(suppliers.id, session.user.supplierId))
      .limit(1)

    if (process && supplier) {
      await inngest.send({
        name: "email/proposal-submitted",
        data: {
          supplierName: supplier.companyName,
          supplierEmail: supplier.email || "",
          processTitle: process.title,
          proposalValue,
          organId: process.organId,
        },
      })
    }
  } catch (e) {
    console.error("[inngest] Failed to enqueue proposal notification:", e)
  }

  revalidatePath("/dashboard")
  return { success: true }
}
