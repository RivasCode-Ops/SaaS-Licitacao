"use server"

import { getSession } from "@saas/auth"
import { db, processSuppliers, biddingProcesses, users, suppliers } from "@saas/db"
import { eq, and, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { sendEmail, proposalSubmittedEmail } from "@/lib/email"
import { saveFile } from "@/lib/storage"

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

  const processId = Number(formData.get("processId"))
  const proposalValue = formData.get("proposalValue") as string
  const file = formData.get("proposalFile") as File | null

  if (!processId || !proposalValue) return { error: "Preencha todos os campos" }

  const link = await db.query.processSuppliers.findFirst({
    where: and(
      eq(processSuppliers.processId, processId),
      eq(processSuppliers.supplierId, session.user.supplierId)
    ),
  })

  if (!link) return { error: "Vínculo não encontrado" }

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
      .select({ companyName: suppliers.companyName })
      .from(suppliers)
      .where(eq(suppliers.id, session.user.supplierId))
      .limit(1)

    if (process && supplier) {
      const admins = await db
        .select({ name: users.name, email: users.email })
        .from(users)
        .where(
          and(
            eq(users.organId, process.organId),
            inArray(users.role, ["admin", "manager"])
          )
        )

      for (const admin of admins) {
        const msg = proposalSubmittedEmail(
          admin.name,
          supplier.companyName,
          process.title,
          proposalValue
        )
        await sendEmail({ to: admin.email, ...msg })
      }
    }
  } catch (e) {
    console.error("[email] Failed to notify admins:", e)
  }

  revalidatePath("/dashboard")
  return { success: true }
}
