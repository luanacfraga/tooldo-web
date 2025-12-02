import { z } from 'zod'

export const inviteEmployeeSchema = z.object({
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  firstName: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres'),
  lastName: z
    .string()
    .min(1, 'Sobrenome é obrigatório')
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres'),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone inválido (apenas números)')
    .optional(),
  document: z
    .string()
    .regex(/^\d{11,14}$/, 'Documento inválido (CPF: 11 dígitos, CNPJ: 14 dígitos)')
    .optional(),
  role: z.enum(['manager', 'executor', 'consultant'], {
    errorMap: () => ({ message: 'Cargo deve ser manager, executor ou consultant' }),
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
    phone: z
      .string()
      .regex(/^\d{10,11}$/, 'Telefone inválido (apenas números)')
      .optional(),
    document: z
      .string()
      .regex(/^\d{11,14}$/, 'Documento inválido (CPF: 11 dígitos, CNPJ: 14 dígitos)')
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type InviteEmployeeFormData = z.infer<typeof inviteEmployeeSchema>
export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>

