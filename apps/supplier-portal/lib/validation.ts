import { z } from "zod"

export const supplierLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export const submitProposalSchema = z.object({
  processId: z.coerce.number().int().positive(),
  proposalValue: z
    .string()
    .min(1, "Valor da proposta é obrigatório")
    .regex(/^\d{1,3}(\.\d{3})*,\d{2}$/, "Formato inválido. Ex: 150.000,00"),
})
