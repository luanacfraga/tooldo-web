import { z } from 'zod'

export const planSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  description: z
    .string()
    .optional(),
  price: z
    .number()
    .min(0, 'Preço não pode ser negativo'),
  maxCompanies: z
    .number()
    .int('Deve ser um número inteiro')
    .min(1, 'Deve permitir pelo menos 1 empresa'),
  maxManagers: z
    .number()
    .int('Deve ser um número inteiro')
    .min(0, 'Não pode ser negativo'),
  maxExecutors: z
    .number()
    .int('Deve ser um número inteiro')
    .min(0, 'Não pode ser negativo'),
  maxConsultants: z
    .number()
    .int('Deve ser um número inteiro')
    .min(0, 'Não pode ser negativo'),
  iaCallsLimit: z
    .number()
    .int('Deve ser um número inteiro')
    .min(0, 'Não pode ser negativo'),
  isActive: z
    .boolean()
    .optional()
    .default(true),
})

export type PlanFormData = z.infer<typeof planSchema>
