"use client"

import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react"

type Deadline = {
  id: number
  stage: string
  process: string
  deadline: string
  remainingDays: number
  overdue: boolean
}

type Props = {
  deadlines: (Deadline | null)[]
}

export function DeadlinesList({ deadlines }: Props) {
  const valid = deadlines.filter(Boolean) as Deadline[]

  if (valid.length === 0) return (
    <p className="text-sm text-muted py-8 text-center">
      Nenhuma etapa ativa no momento.
    </p>
  )

  return (
    <div className="space-y-3">
      {valid.map((d) => (
        <div
          key={d.id}
          className={`flex items-center justify-between p-3 rounded-lg border ${
            d.overdue
              ? "border-red-200 bg-red-50"
              : d.remainingDays <= 7
                ? "border-amber-200 bg-amber-50"
                : "border-gray-100"
          }`}
        >
          <div className="flex items-center gap-3">
            {d.overdue ? (
              <AlertTriangle className="size-5 text-red-500 shrink-0" />
            ) : d.remainingDays <= 7 ? (
              <Clock className="size-5 text-amber-500 shrink-0" />
            ) : (
              <CheckCircle2 className="size-5 text-green-500 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium">{d.stage}</p>
              <p className="text-xs text-muted">{d.process}</p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className={`text-sm font-semibold ${d.overdue ? "text-red-600" : ""}`}>
              {d.overdue ? "Vencido" : `${d.remainingDays} dias`}
            </p>
            <p className="text-xs text-muted">{d.deadline}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
