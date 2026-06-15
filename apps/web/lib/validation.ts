import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export const signUpSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

export const documentUploadSchema = z.object({
  processId: z.coerce.number().int().positive(),
  name: z.string().min(1, "Nome do documento é obrigatório"),
})

export const linkSupplierSchema = z.object({
  processId: z.coerce.number().int().positive(),
  supplierIds: z.array(z.coerce.number().int().positive()).min(1, "Selecione ao menos um fornecedor"),
})

export const proposalStatusSchema = z.object({
  processSupplierId: z.coerce.number().int().positive(),
  status: z.enum(["approved", "rejected"]),
})

export const organUpdateSchema = z.object({
  organId: z.coerce.number().int().positive(),
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, "Estado deve ter 2 caracteres").optional(),
  phone: z.string().optional(),
})
