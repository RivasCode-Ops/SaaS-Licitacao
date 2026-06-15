import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ─── Enums ───────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["admin", "manager", "viewer"])
export const supplierStatusEnum = pgEnum("supplier_status", [
  "pending",
  "qualified",
  "disqualified",
])
export const stageStatusEnum = pgEnum("stage_status", [
  "pending",
  "active",
  "completed",
  "cancelled",
])
export const modalityEnum = pgEnum("modality", [
  "pregao",
  "concorrencia",
  "tomada_precos",
  "convite",
  "concurso",
  "leilao",
  "dispensa",
  "inexigibilidade",
])

// ─── Organs (órgãos públicos — tenants) ──────────────────────────

export const organs = pgTable(
  "organs",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    phone: varchar("phone", { length: 20 }),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("organs_cnpj_idx").on(table.cnpj)]
)

// ─── Users ────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").default("viewer").notNull(),
    organId: integer("organ_id").references(() => organs.id, {
      onDelete: "set null",
    }),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)]
)

// ─── Suppliers (fornecedores) ─────────────────────────────────────

export const suppliers = pgTable(
  "suppliers",
  {
    id: serial("id").primaryKey(),
    organId: integer("organ_id")
      .notNull()
      .references(() => organs.id, { onDelete: "cascade" }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
    tradeName: varchar("trade_name", { length: 255 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    status: supplierStatusEnum("status").default("pending").notNull(),
    qualificationDocs: text("qualification_docs"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("suppliers_organ_idx").on(table.organId),
    uniqueIndex("suppliers_cnpj_idx").on(table.cnpj),
  ]
)

// ─── Bidding Processes (processos licitatórios) ───────────────────

export const biddingProcesses = pgTable(
  "bidding_processes",
  {
    id: serial("id").primaryKey(),
    organId: integer("organ_id")
      .notNull()
      .references(() => organs.id, { onDelete: "cascade" }),
    number: varchar("number", { length: 50 }).notNull(),
    year: integer("year").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    modality: modalityEnum("modality").notNull(),
    value: varchar("value", { length: 50 }),
    openingDate: timestamp("opening_date"),
    closingDate: timestamp("closing_date"),
    currentStageId: integer("current_stage_id"),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("processes_organ_idx").on(table.organId),
    uniqueIndex("processes_number_year_idx").on(table.number, table.year),
  ]
)

// ─── Process Stages (etapas do workflow) ─────────────────────────

export const processStages = pgTable(
  "process_stages",
  {
    id: serial("id").primaryKey(),
    processId: integer("process_id")
      .notNull()
      .references(() => biddingProcesses.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    order: integer("order").notNull(),
    status: stageStatusEnum("status").default("pending").notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("stages_process_idx").on(table.processId)]
)

// ─── Documents ────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  processId: integer("process_id")
    .notNull()
    .references(() => biddingProcesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  url: text("url").notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// ─── Activity Logs ────────────────────────────────────────────────

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    organId: integer("organ_id").references(() => organs.id, {
      onDelete: "set null",
    }),
    processId: integer("process_id").references(() => biddingProcesses.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 50 }).notNull(),
    details: text("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("logs_organ_idx").on(table.organId)]
)

// ─── Relations ────────────────────────────────────────────────────

export const organsRelations = relations(organs, ({ many }) => ({
  users: many(users),
  processes: many(biddingProcesses),
  logs: many(activityLogs),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  organ: one(organs, {
    fields: [users.organId],
    references: [organs.id],
  }),
  documents: many(documents),
  logs: many(activityLogs),
}))

export const biddingProcessesRelations = relations(
  biddingProcesses,
  ({ one, many }) => ({
    organ: one(organs, {
      fields: [biddingProcesses.organId],
      references: [organs.id],
    }),
    stages: many(processStages),
    documents: many(documents),
    logs: many(activityLogs),
  })
)

export const documentsRelations = relations(documents, ({ one }) => ({
  process: one(biddingProcesses, {
    fields: [documents.processId],
    references: [biddingProcesses.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}))

export const processStagesRelations = relations(
  processStages,
  ({ one }) => ({
    process: one(biddingProcesses, {
      fields: [processStages.processId],
      references: [biddingProcesses.id],
    }),
  })
)
