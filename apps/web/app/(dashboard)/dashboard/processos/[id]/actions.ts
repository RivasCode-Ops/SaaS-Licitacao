"use server"

import { revalidatePath } from "next/cache"
import { db, documents } from "@saas/db"
import { eq } from "drizzle-orm"
import { saveFile, deleteFile } from "@saas/shared"
import { documentUploadSchema } from "@/lib/validation"
import { getSession, rateLimitByUser } from "@saas/auth"

export async function uploadDocumentAction(form: FormData) {
  const session = await getSession()
  if (!session?.user?.id) return { error: "Não autenticado" }
  if (!(await rateLimitByUser(session.user.id, 10, "60 s")))
    return { error: "Muitas tentativas. Aguarde um minuto." }

  const raw = {
    processId: form.get("processId"),
    name: form.get("name"),
  }
  const parsed = documentUploadSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { processId, name } = parsed.data
  const file = form.get("file") as File
  if (!file || file.size === 0) return { error: "Arquivo é obrigatório" }
  if (file.size > 10 * 1024 * 1024) return { error: "Arquivo deve ter no máximo 10MB" }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await saveFile(file.name, buffer)

  try {
    await db.insert(documents).values({
      processId,
      name,
      type: file.type || "application/octet-stream",
      url,
    })
    revalidatePath(`/dashboard/processos/${processId}`)
    return { success: true }
  } catch {
    return { error: "Erro ao salvar documento" }
  }
}

export async function deleteDocumentAction(documentId: number) {
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1)

  if (doc) {
    await deleteFile(doc.url)
    await db.delete(documents).where(eq(documents.id, documentId))
    revalidatePath(`/dashboard/processos/${doc.processId}`)
  }
}
