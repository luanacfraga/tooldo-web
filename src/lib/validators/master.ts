import { z } from 'zod'

export const registerMasterSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Nome é obrigatório')
      .min(2, 'Nome deve ter no mínimo 2 caracteres'),
    lastName: z
      .string()
      .min(1, 'Sobrenome é obrigatório')
      .min(2, 'Sobrenome deve ter no mínimo 2 caracteres'),
    email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
    phone: z
      .string()
      .min(1, 'Telefone é obrigatório')
      .refine(
        (val) => {
          const digits = val.replace(/\D/g, '')
          return digits.length === 11 || digits.length === 10
        },
        { message: 'Digite o telefone completo (10 ou 11 dígitos)' }
      ),
    document: z
      .string()
      .min(1, 'CPF é obrigatório')
      .regex(/^\d{11}$/, 'CPF deve conter 11 dígitos'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterMasterFormData = z.infer<typeof registerMasterSchema>
