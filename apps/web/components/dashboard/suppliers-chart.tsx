"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = ["#f59e0b", "#10b981", "#ef4444"]

type Props = {
  data: { name: string; value: number }[]
}

export function SuppliersChart({ data }: Props) {
  if (data.length === 0) return (
    <p className="text-sm text-muted py-8 text-center">Nenhum fornecedor cadastrado.</p>
  )

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={50}
          paddingAngle={4}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb" }}
          formatter={(value, name) => [value, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
