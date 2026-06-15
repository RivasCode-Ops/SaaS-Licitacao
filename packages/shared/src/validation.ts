import { z } from "zod"

export const emailSchema = z.string().email("Email inválido")

export const passwordSchema = z
  .string()
  .min(6, "Senha deve ter no mínimo 6 caracteres")

export const cnpjSchema = z
  .string()
  .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido")

export const organSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cnpj: cnpjSchema,
  city: z.string().optional(),
  state: z.string().length(2, "Estado deve ter 2 caracteres").optional(),
})

export const supplierSchema = z.object({
  companyName: z.string().min(1, "Nome é obrigatório"),
  cnpj: cnpjSchema,
  email: emailSchema.optional().or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, "Estado deve ter 2 caracteres").optional(),
})

export const processSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  modality: z.enum([
    "pregao",
    "concorrencia",
    "tomada_precos",
    "convite",
    "concurso",
    "leilao",
    "dispensa",
    "inexigibilidade",
  ]),
  number: z.string().min(1, "Número é obrigatório"),
  description: z.string().optional(),
  year: z.coerce.number().int().min(2020).max(2099),
})

export const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["admin", "manager", "viewer", "supplier"]),
})
