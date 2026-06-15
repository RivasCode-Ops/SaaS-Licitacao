"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { uploadDocumentAction } from "./actions"

export function UploadForm({ processId }: { processId: number }) {
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)
    const form = new FormData(e.currentTarget)
    form.set("processId", String(processId))
    const result = await uploadDocumentAction(form)
    setUploading(false)
    if (result?.success) {
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4"
    >
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium mb-1">Nome do documento</label>
        <input
          name="name"
          required
          placeholder="Ex: Edital.pdf"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-sm font-medium mb-1">Arquivo</label>
        <input
          type="file"
          name="file"
          required
          className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
      </div>
      <button
        type="submit"
        disabled={uploading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
      >
        <Upload className="size-4" />
        {uploading ? "Enviando..." : "Upload"}
      </button>
    </form>
  )
}
