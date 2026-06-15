"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db/drizzle"
import { documents } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { saveFile, deleteFile as removeFile } from "@/lib/storage"

export async function uploadDocumentAction(form: FormData) {
  const processId = parseInt(form.get("processId") as string)
  const file = form.get("file") as File
  const name = form.get("name") as string

  if (!processId || !file || !name) return { error: "Campos obrigatórios" }

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
    await removeFile(doc.url)
    await db.delete(documents).where(eq(documents.id, documentId))
    revalidatePath(`/dashboard/processos/${doc.processId}`)
  }
}
