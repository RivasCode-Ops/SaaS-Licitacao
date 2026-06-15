import { NextResponse } from "next/server"
import { checkOverdueStages } from "@/lib/workflow/engine"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const advanced = await checkOverdueStages()
  return NextResponse.json({ advanced })
}
