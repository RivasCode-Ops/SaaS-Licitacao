import { serve } from "inngest/next"
import { inngest } from "@saas/shared"
import {
  welcomeJob,
  proposalSubmittedJob,
  proposalStatusJob,
  checkOverdueStagesJob,
} from "@/lib/inngest/functions"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    welcomeJob,
    proposalSubmittedJob,
    proposalStatusJob,
    checkOverdueStagesJob,
  ],
})
