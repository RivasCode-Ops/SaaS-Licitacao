"use server"

import { comparePasswords, setSession } from "@saas/auth"
import { db, users } from "@saas/db"
import { eq } from "drizzle-orm"
import { supplierLoginSchema } from "@/lib/validation"

export type ActionState = {
  error?: string
  success?: boolean
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = supplierLoginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { email, password } = parsed.data

  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!user || !(await comparePasswords(password, user.passwordHash))) {
    return { error: "Email ou senha inválidos" }
  }

  if (!user.organId) {
    return { error: "Usuário sem órgão vinculado" }
  }

  await setSession({
    id: user.id,
    email: user.email,
    name: user.name,
    organId: user.organId!,
    supplierId: user.supplierId,
  })

  return { success: true }
}
