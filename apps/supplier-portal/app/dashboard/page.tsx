import { getSession } from "@saas/auth"
import { redirect } from "next/navigation"
import { db, biddingProcesses } from "@saas/db"
import { desc, eq } from "drizzle-orm"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session?.user?.organId) redirect("/login")

  const processes = await db.query.biddingProcesses.findMany({
    where: eq(biddingProcesses.organId, session.user.organId),
    orderBy: desc(biddingProcesses.createdAt),
  })

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Meus Processos</h1>

      <div className="space-y-3">
        {processes.length === 0 ? (
          <p className="text-muted text-sm">Nenhum processo encontrado.</p>
        ) : (
          processes.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-border bg-white p-4"
            >
              <h2 className="font-semibold">{p.title}</h2>
              <p className="text-sm text-muted mt-1">
                {p.number}/{p.year}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
