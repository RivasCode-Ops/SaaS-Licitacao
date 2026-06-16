import { inngest } from "@saas/shared"
import { sendEmail, welcomeEmail, proposalSubmittedEmail, proposalStatusEmail } from "@/lib/email"
import { db, users } from "@saas/db"
import { eq } from "drizzle-orm"

export const welcomeJob = inngest.createFunction(
  {
    id: "send-welcome-email",
    triggers: { event: "email/welcome" },
  },
  async ({ event }: { event: { data: { name: string; email: string } } }) => {
    const msg = welcomeEmail(event.data.name)
    await sendEmail({ to: event.data.email, ...msg })
  }
)

export const proposalSubmittedJob = inngest.createFunction(
  {
    id: "send-proposal-submitted",
    triggers: { event: "email/proposal-submitted" },
  },
  async ({
    event,
  }: {
    event: {
      data: {
        supplierName: string
        supplierEmail: string
        processTitle: string
        proposalValue: string
        organId: number
      }
    }
  }) => {
    const admins = await db
      .select()
      .from(users)
      .where(eq(users.organId, event.data.organId))

    const adminEmails = admins
      .filter((u) => ["admin", "manager"].includes(u.role))
      .map((u) => u.email)
      .filter(Boolean)

    if (adminEmails.length === 0) return

    const msg = proposalSubmittedEmail(
      event.data.supplierName,
      event.data.supplierName,
      event.data.processTitle,
      event.data.proposalValue
    )

    await Promise.all(
      adminEmails.map((email) => sendEmail({ to: email, ...msg }))
    )
  }
)

export const proposalStatusJob = inngest.createFunction(
  {
    id: "send-proposal-status",
    triggers: { event: "email/proposal-status" },
  },
  async ({
    event,
  }: {
    event: {
      data: {
        supplierName: string
        supplierEmail: string
        processTitle: string
        status: string
      }
    }
  }) => {
    const msg = proposalStatusEmail(
      event.data.supplierName,
      event.data.processTitle,
      event.data.status
    )
    await sendEmail({ to: event.data.supplierEmail, ...msg })
  }
)

export const checkOverdueStagesJob = inngest.createFunction(
  {
    id: "check-overdue-stages",
    triggers: { event: "stages/check-overdue" },
  },
  async () => {
    const { checkOverdueStages } = await import("@/lib/workflow/engine")
    await checkOverdueStages()
  }
)
