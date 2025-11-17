import { z } from 'zod'

export const teamSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  companyId: z
    .string()
    .min(1, 'Empresa é obrigatória'),
  managerId: z
    .string()
    .min(1, 'Gerente é obrigatório'),
})

export type TeamFormData = z.infer<typeof teamSchema>
