import "dotenv/config"
import { db } from "./drizzle"
import { organs, users, documents, activityLogs, suppliers } from "./schema"
import { hashPassword } from "../auth/session"
import { createProcess } from "./queries"

async function clean() {
  await db.delete(documents)
  await db.delete(activityLogs)
  await db.delete(suppliers)
  await db.delete(users)
  await db.delete(organs)
}

async function seed() {
  console.log("🌱 Seeding database...")
  await clean()

  const [adm] = await db
    .insert(organs)
    .values({
      name: "Prefeitura Municipal de Exemplo",
      cnpj: "11.222.333/0001-44",
      slug: "pm-exemplo",
      city: "Exemplo",
      state: "SP",
    })
    .returning()

  const passwordHash = await hashPassword("123456")
  await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@licita.dev",
      passwordHash,
      role: "admin",
      organId: adm.id,
    })
    .returning()

  await createProcess({
    organId: adm.id,
    number: "001",
    year: 2026,
    title: "Pregão Eletrônico - Material de Escritório",
    modality: "pregao",
    description: "Aquisição de material de escritório para administração municipal.",
  })

  await createProcess({
    organId: adm.id,
    number: "002",
    year: 2026,
    title: "Concorrência - Reforma de Prédio Público",
    modality: "concorrencia",
    description: "Reforma do prédio sede da prefeitura municipal.",
  })

  console.log("✅ Seed complete!")
  console.log(`   Organ: ${adm.name} (${adm.slug})`)
  console.log(`   User: admin@licita.dev / 123456`)
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
})
