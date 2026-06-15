"use server"

import { comparePasswords, setSession } from "@/lib/auth/session"
import { createUser, getUserByEmail } from "@/lib/db/queries"
import { db } from "@/lib/db/drizzle"
import { activityLogs } from "@/lib/db/schema"
import { sendEmail, welcomeEmail } from "@/lib/email"

export type ActionState = {
  error?: string
  success?: boolean
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Preencha todos os campos" }
  if (!email.includes("@")) return { error: "Email inválido" }

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
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) return { error: "Preencha todos os campos" }
  if (!email.includes("@")) return { error: "Email inválido" }
  if (password.length < 6)
    return { error: "Senha deve ter no mínimo 6 caracteres" }

  const existing = await getUserByEmail(email)
  if (existing) return { error: "Este email já está cadastrado." }

  await createUser({ name, email, password, role: "viewer" })

  const msg = welcomeEmail(name)
  await sendEmail({ to: email, ...msg })

  return { success: true }
}

