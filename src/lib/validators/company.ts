import { z } from 'zod'

export const companySchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  adminId: z
    .string()
    .min(1, 'Admin é obrigatório'),
})

export type CompanyFormData = z.infer<typeof companySchema>
