"use server"

import { clearSession } from "./session"

export async function logoutAction(): Promise<void> {
  await clearSession()
}
