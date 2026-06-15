"use client"

import { useRouter } from "next/navigation"
import { FileText, Trash2, Download } from "lucide-react"
import { deleteDocumentAction } from "./actions"

type Document = {
  id: number
  name: string
  type: string
  url: string
  createdAt: string
}

export function DocumentList({
  documents,
  processId,
}: {
  documents: Document[]
  processId: number
}) {
  const router = useRouter()

  async function handleDelete(id: number) {
    if (!confirm("Excluir este documento?")) return
    await deleteDocumentAction(id)
    router.refresh()
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted">
        <FileText className="size-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum documento anexado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 rounded-lg border border-border bg-gray-50"
        >
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="size-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-muted">
                {new Date(doc.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={doc.url}
              target="_blank"
              className="p-1.5 text-muted hover:text-primary rounded"
              title="Download"
            >
              <Download className="size-4" />
            </a>
            <button
              onClick={() => handleDelete(doc.id)}
              className="p-1.5 text-muted hover:text-danger rounded"
              title="Excluir"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
