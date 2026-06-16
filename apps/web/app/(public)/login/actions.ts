"use server"

import { comparePasswords, setSession, rateLimitByIP } from "@saas/auth"
import { createUser, getUserByEmail } from "@/lib/db/queries"
import { db, activityLogs } from "@saas/db"
import { signInSchema, signUpSchema } from "@/lib/validation"
import { inngest } from "@saas/shared"

export type ActionState = {
  error?: string
  success?: boolean
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { email, password } = parsed.data

  if (!(await rateLimitByIP(5, "60 s")))
    return { error: "Muitas tentativas. Aguarde um minuto." }

  const user = await getUserByEmail(email)
  if (!user) return { error: "Email ou senha inválidos." }

  const valid = await comparePasswords(password, user.passwordHash)
  if (!valid) return { error: "Email ou senha inválidos." }

  await db.insert(activityLogs).values({
    userId: user.id,
    organId: user.organId,
    action: "login",
  })

  await setSession({ id: user.id, email: user.email, name: user.name, organId: user.organId ?? 1 })

  return { success: true }
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { name, email, password } = parsed.data

  if (!(await rateLimitByIP(3, "60 s")))
    return { error: "Muitas tentativas. Aguarde um minuto." }

  const existing = await getUserByEmail(email)
  if (existing) return { error: "Este email já está cadastrado." }

  await createUser({ name, email, password, role: "viewer" })

  await inngest.send({ name: "email/welcome", data: { name, email } })

  return { success: true }
}

