import { z } from 'zod'

export const inviteEmployeeSchema = z.object({
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  firstName: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome deve ter no mínimo 2 caracteres'),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres'),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true
        const digits = val.replace(/\D/g, '')
        return digits.length === 11 || digits.length === 10
      },
      { message: 'Digite o telefone completo (10 ou 11 dígitos)' }
    ),
  document: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine((val) => /^\d{11}$/.test(val), {
      message: 'CPF inválido (deve conter 11 dígitos)',
    }),
  role: z.enum(['manager', 'executor', 'consultant'], {
    errorMap: () => ({ message: 'Cargo deve ser gestor, executor ou consultor' }),
  }),
  position: z.string().optional(),
  notes: z.string().optional(),
})

export const acceptInviteSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    document: z
      .string()
      .refine((val) => !val || /^\d{11}$/.test(val), {
        message: 'CPF inválido (deve conter 11 dígitos)',
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type InviteEmployeeFormData = z.infer<typeof inviteEmployeeSchema>
export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>
