import "server-only"
import { db, processSuppliers, biddingProcesses, organs } from "@saas/db"
import { eq, desc, and } from "drizzle-orm"

export type SupplierProcess = {
  id: number
  number: string
  year: number
  title: string
  modality: string
  organName: string
  proposalValue: string | null
  proposalFile: string | null
  status: string
  createdAt: Date
}

export async function getSupplierProcesses(
  supplierId: number
): Promise<SupplierProcess[]> {
  const rows = await db
    .select({
      id: biddingProcesses.id,
      number: biddingProcesses.number,
      year: biddingProcesses.year,
      title: biddingProcesses.title,
      modality: biddingProcesses.modality,
      organName: organs.name,
      proposalValue: processSuppliers.proposalValue,
      proposalFile: processSuppliers.proposalFile,
      status: processSuppliers.status,
      createdAt: processSuppliers.createdAt,
    })
    .from(processSuppliers)
    .innerJoin(
      biddingProcesses,
      eq(processSuppliers.processId, biddingProcesses.id)
    )
    .innerJoin(organs, eq(biddingProcesses.organId, organs.id))
    .where(eq(processSuppliers.supplierId, supplierId))
    .orderBy(desc(processSuppliers.createdAt))

  return rows
}
