import { z } from 'zod'

export const userRoles = ['master', 'admin', 'manager', 'executor', 'consultant'] as const

export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  role: z.enum(userRoles, {
    errorMap: () => ({ message: 'Selecione um papel válido' }),
  }),
})

export const updateUserSchema = userSchema.partial().extend({
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional()
    .or(z.literal('')),
})

export type UserFormData = z.infer<typeof userSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
