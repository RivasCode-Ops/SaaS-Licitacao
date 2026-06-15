import "dotenv/config"
import { eq } from "drizzle-orm"
import { db, organs, users, biddingProcesses, processStages, documents, activityLogs, suppliers } from "@saas/db"
import { hashPassword } from "@saas/auth"
import { createSupplier } from "./queries"
import { createProcess } from "./queries"

async function clean() {
  await db.delete(documents)
  await db.delete(activityLogs)
  await db.delete(processStages)
  await db.delete(biddingProcesses)
  await db.delete(suppliers)
  await db.delete(users)
  await db.delete(organs)
}

async function seed() {
  console.log("🌱 Seeding database...")
  await clean()

  // ── Organs ──────────────────────────────────────────────────────

  const [pmExemplo] = await db
    .insert(organs)
    .values({
      name: "Prefeitura Municipal de Exemplo",
      cnpj: "11.222.333/0001-44",
      slug: "pm-exemplo",
      address: "Rua Principal, 100, Centro, Exemplo/SP",
      city: "Exemplo",
      state: "SP",
      phone: "(16) 3333-4444",
    })
    .returning()

  const [camara] = await db
    .insert(organs)
    .values({
      name: "Câmara Municipal de Exemplo",
      cnpj: "44.555.666/0001-77",
      slug: "cm-exemplo",
      address: "Av. das Leis, 200, Centro, Exemplo/SP",
      city: "Exemplo",
      state: "SP",
      phone: "(16) 3333-5555",
    })
    .returning()

  const passwordHash = await hashPassword("123456")

  // ── Users ───────────────────────────────────────────────────────

  const [adminPM] = await db
    .insert(users)
    .values({
      name: "Carlos Silva",
      email: "admin@licita.dev",
      passwordHash,
      role: "admin",
      organId: pmExemplo.id,
    })
    .returning()

  const [gerentePM] = await db
    .insert(users)
    .values({
      name: "Ana Oliveira",
      email: "gerente@licita.dev",
      passwordHash,
      role: "manager",
      organId: pmExemplo.id,
    })
    .returning()

  const [viewerPM] = await db
    .insert(users)
    .values({
      name: "Pedro Santos",
      email: "viewer@licita.dev",
      passwordHash,
      role: "viewer",
      organId: pmExemplo.id,
    })
    .returning()

  const [adminCM] = await db
    .insert(users)
    .values({
      name: "Marina Costa",
      email: "camara@licita.dev",
      passwordHash,
      role: "admin",
      organId: camara.id,
    })
    .returning()

  // ── Suppliers ───────────────────────────────────────────────────

  const sup1 = await createSupplier({
    organId: pmExemplo.id,
    companyName: "Papelaria Modelo Ltda",
    tradeName: "Papelaria Modelo",
    cnpj: "11.111.111/0001-11",
    email: "contato@papelariamodelo.com.br",
    phone: "(16) 3333-0101",
    city: "Exemplo",
    state: "SP",
    status: "qualified",
  })

  const sup2 = await createSupplier({
    organId: pmExemplo.id,
    companyName: "Construtora Exemplo S.A.",
    tradeName: "Construtora Exemplo",
    cnpj: "22.222.222/0001-22",
    email: "propostas@construtoraexemplo.com.br",
    phone: "(16) 3333-0202",
    city: "Exemplo",
    state: "SP",
    status: "qualified",
  })

  const sup3 = await createSupplier({
    organId: pmExemplo.id,
    companyName: "Tech Solutions Ltda",
    tradeName: "Tech Solutions",
    cnpj: "33.333.333/0001-33",
    email: "vendas@techsolutions.com.br",
    phone: "(11) 99999-8888",
    city: "São Paulo",
    state: "SP",
    status: "pending",
  })

  const sup4 = await createSupplier({
    organId: pmExemplo.id,
    companyName: "Alimentos Fresh Ltda",
    tradeName: "Alimentos Fresh",
    cnpj: "55.666.777/0001-99",
    email: "comercial@alimentosfresh.com.br",
    phone: "(16) 3333-0303",
    city: "Exemplo",
    state: "SP",
    status: "qualified",
  })

  const sup5 = await createSupplier({
    organId: pmExemplo.id,
    companyName: "Transportadora Rápida Eireli",
    tradeName: "Trans Rápida",
    cnpj: "66.777.888/0001-11",
    email: "adm@transrapida.com.br",
    phone: "(16) 3333-0404",
    city: "Exemplo",
    state: "SP",
    status: "disqualified",
  })

  const sup6 = await createSupplier({
    organId: camara.id,
    companyName: "Gráfica do Povo Ltda",
    tradeName: "Gráfica do Povo",
    cnpj: "77.888.999/0001-22",
    email: "vendas@graficadopovo.com.br",
    phone: "(16) 3333-0505",
    city: "Exemplo",
    state: "SP",
    status: "qualified",
  })

  // ── Helper to simulate stage advancement ───────────────────────

  async function advanceProcess(processId: number, stagesToComplete: number) {
    const stages = await db
      .select()
      .from(processStages)
      .where(eq(processStages.processId, processId))
      .orderBy(processStages.order)

    for (let i = 0; i < stagesToComplete && i < stages.length; i++) {
      if (i === stagesToComplete - 1 && i < stages.length - 1) {
        // leave the last one active
        await db
          .update(processStages)
          .set({ status: "active", startedAt: new Date() })
          .where(eq(processStages.id, stages[i].id))
      } else {
        await db
          .update(processStages)
          .set({
            status: "completed",
            startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 * (stages.length - i)),
            completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 * (stages.length - i - 1)),
          })
          .where(eq(processStages.id, stages[i].id))
      }
    }
  }

  // ── Processes (Prefeitura) ─────────────────────────────────────

  const p1 = await createProcess({
    organId: pmExemplo.id,
    number: "001",
    year: 2026,
    title: "Pregão Eletrônico - Material de Escritório",
    modality: "pregao",
    description: "Aquisição de material de escritório para administração municipal. Itens: papel A4, toners, canetas, pastas e demais insumos.",
  })
  await advanceProcess(p1!.id, 3)

  const p2 = await createProcess({
    organId: pmExemplo.id,
    number: "002",
    year: 2026,
    title: "Concorrência - Reforma do Prédio Sede",
    modality: "concorrencia",
    description: "Reforma completa do prédio sede da prefeitura, incluindo pintura, elétrica, hidráulica e acessibilidade.",
  })
  await advanceProcess(p2!.id, 2)

  const p3 = await createProcess({
    organId: pmExemplo.id,
    number: "003",
    year: 2026,
    title: "Tomada de Preços - Pavimentação de Ruas",
    modality: "tomada_precos",
    description: "Pavimentação asfáltica de 5 km de vias públicas no bairro Jardim América.",
  })
  await advanceProcess(p3!.id, 1)

  const p4 = await createProcess({
    organId: pmExemplo.id,
    number: "004",
    year: 2026,
    title: "Convite - Manutenção de Veículos",
    modality: "convite",
    description: "Serviços de manutenção preventiva e corretiva da frota municipal.",
  })
  // p4 stays at stage 1 (active)

  const p5 = await createProcess({
    organId: pmExemplo.id,
    number: "005",
    year: 2026,
    title: "Concurso Público - Edital 001/2026",
    modality: "concurso",
    description: "Concurso público para provimento de 50 vagas em cargos efetivos da administração municipal.",
  })
  await advanceProcess(p5!.id, 2)

  const p6 = await createProcess({
    organId: pmExemplo.id,
    number: "006",
    year: 2026,
    title: "Leilão - Venda de Veículos Inservíveis",
    modality: "leilao",
    description: "Leilão para alienação de veículos considerados inservíveis para a administração.",
  })
  // p6 stays at stage 1

  const p7 = await createProcess({
    organId: pmExemplo.id,
    number: "007",
    year: 2026,
    title: "Dispensa - Gêneros Alimentícios",
    modality: "dispensa",
    description: "Aquisição emergencial de gêneros alimentícios para merenda escolar conforme art. 24, inciso IV da Lei 8.666/93.",
  })
  await advanceProcess(p7!.id, 1)

  const p8 = await createProcess({
    organId: pmExemplo.id,
    number: "008",
    year: 2026,
    title: "Inexigibilidade - Serviço de Assessoria Jurídica",
    modality: "inexigibilidade",
    description: "Contratação de serviços de assessoria jurídica especializada, por notória especialização, conforme art. 25 da Lei 8.666/93.",
  })
  await advanceProcess(p8!.id, 2)

  // ── Processes (Câmara) ─────────────────────────────────────────

  const p9 = await createProcess({
    organId: camara.id,
    number: "050",
    year: 2026,
    title: "Pregão - Equipamentos de Informática",
    modality: "pregao",
    description: "Aquisição de computadores, notebooks e periféricos para a Câmara Municipal.",
  })
  await advanceProcess(p9!.id, 2)

  // ── Activity Logs ───────────────────────────────────────────────

  const logEntries = [
    { userId: adminPM.id, organId: pmExemplo.id, processId: p1!.id, action: "process_created", details: "Processo 001/2026 criado" },
    { userId: adminPM.id, organId: pmExemplo.id, processId: p1!.id, action: "stage_advanced", details: "Etapa 'Edital' concluída" },
    { userId: gerentePM.id, organId: pmExemplo.id, processId: p1!.id, action: "stage_advanced", details: "Etapa 'Publicação' concluída" },
    { userId: adminPM.id, organId: pmExemplo.id, processId: p2!.id, action: "process_created", details: "Processo 002/2026 criado" },
    { userId: adminPM.id, organId: pmExemplo.id, processId: p2!.id, action: "stage_advanced", details: "Etapa 'Edital' concluída" },
    { userId: adminPM.id, organId: pmExemplo.id, processId: p5!.id, action: "process_created", details: "Processo 005/2026 criado" },
    { userId: adminPM.id, organId: pmExemplo.id, processId: p5!.id, action: "stage_advanced", details: "Etapa 'Edital' concluída" },
    { userId: adminPM.id, organId: pmExemplo.id, processId: p8!.id, action: "process_created", details: "Processo 008/2026 criado" },
    { userId: adminPM.id, organId: pmExemplo.id, processId: p8!.id, action: "stage_advanced", details: "Etapa 'Edital' concluída" },
    { userId: adminCM.id, organId: camara.id, processId: p9!.id, action: "process_created", details: "Processo 001/2026 (Câmara) criado" },
  ]

  for (const log of logEntries) {
    await db.insert(activityLogs).values(log)
  }

  // ── Summary ──────────────────────────────────────────────────────

  console.log("✅ Seed complete!")
  console.log("")
  console.log("📋 Prefeitura Municipal de Exemplo")
  console.log(`   👤 Admin:   admin@licita.dev / 123456`)
  console.log(`   👤 Gerente: gerente@licita.dev / 123456`)
  console.log(`   👤 Viewer:  viewer@licita.dev / 123456`)
  console.log(`   🏭 6 fornecedores · 8 processos`)
  console.log("")
  console.log("📋 Câmara Municipal de Exemplo")
  console.log(`   👤 Admin: camara@licita.dev / 123456`)
  console.log(`   🏭 1 fornecedor · 1 processo`)
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err)
})
