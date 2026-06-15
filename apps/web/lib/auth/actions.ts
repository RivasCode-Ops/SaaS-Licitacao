"use server"

import { clearSession } from "@saas/auth"

export async function logoutAction(): Promise<void> {
  await clearSession()
}
