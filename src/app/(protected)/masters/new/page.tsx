'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { ErrorAlert } from '@/components/auth/login/error-alert'
import { MasterOnly } from '@/components/features/auth/guards/master-only'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { FormFieldWrapper } from '@/components/ui/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { PhoneInput } from '@/components/ui/phone-input'

import { ApiError } from '@/lib/api/api-client'
import { authApi } from '@/lib/api/endpoints/auth'
import { cn } from '@/lib/utils'
import { maskCPF } from '@/lib/utils/masks'
import { registerMasterSchema, type RegisterMasterFormData } from '@/lib/validators/master'

function isApiErrorData(data: unknown): data is { message?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data
      ? typeof (data as { message: unknown }).message === 'string' ||
        (data as { message: unknown }).message === undefined
      : true)
  )
}

function getInputClassName(hasError: boolean): string {
  return cn(
    'h-10 text-sm transition-all',
    hasError
      ? 'border-destructive focus-visible:ring-destructive'
      : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
  )
}

export default function NewMasterUserPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RegisterMasterFormData>({
    resolver: zodResolver(registerMasterSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      document: '',
    },
  })

  const onSubmit = async (data: RegisterMasterFormData) => {
    try {
      setError(null)
      setSuccess(null)
      setIsLoading(true)

      await authApi.registerMaster({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
        document: data.document,
        documentType: 'CPF',
      })

      setSuccess('Usuário master cadastrado com sucesso.')
      reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        document: '',
      })

    } catch (err) {
      if (err instanceof ApiError) {
        const errorMessage = isApiErrorData(err.data) ? err.data.message : undefined
        setError(errorMessage || 'Erro ao cadastrar usuário master. Tente novamente.')
      } else {
        setError('Erro ao cadastrar usuário master. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MasterOnly>
      <PageContainer maxWidth="lg">
        <PageHeader
          title="Novo usuário Master"
          description="Cadastre novos usuários master. Este fluxo é exclusivo para quem já é Master."
        />

        <div className="mt-6 rounded-2xl border border-border/60 bg-card/95 p-6 shadow-sm">
          <form method="POST" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && <ErrorAlert message={error} />}
            {success && (
              <div className="rounded-md border border-emerald-500/50 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldWrapper label="Nome" htmlFor="firstName" error={errors.firstName?.message}>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="João"
                  {...register('firstName')}
                  className={getInputClassName(!!errors.firstName)}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Sobrenome"
                htmlFor="lastName"
                error={errors.lastName?.message}
              >
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Silva"
                  {...register('lastName')}
                  className={getInputClassName(!!errors.lastName)}
                />
              </FormFieldWrapper>
            </div>

            <FormFieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                {...register('email')}
                className={getInputClassName(!!errors.email)}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Telefone" htmlFor="phone" error={errors.phone?.message}>
              <PhoneInput
                id="phone"
                placeholder="(11) 98765-4321"
                value={watch('phone') || ''}
                onChange={(value) => setValue('phone', value)}
                className={getInputClassName(!!errors.phone)}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="CPF" htmlFor="document" error={errors.document?.message}>
              <Input
                id="document"
                type="text"
                placeholder="000.000.000-00"
                value={watch('document') ? maskCPF(watch('document')) : ''}
                onChange={(e) => {
                  const unmasked = e.target.value.replace(/\D/g, '')
                  setValue('document', unmasked)
                }}
                className={getInputClassName(!!errors.document)}
              />
            </FormFieldWrapper>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldWrapper
                label="Senha"
                htmlFor="password"
                error={errors.password?.message}
              >
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={getInputClassName(!!errors.password)}
                />
              </FormFieldWrapper>

              <FormFieldWrapper
                label="Confirmar Senha"
                htmlFor="confirmPassword"
                error={errors.confirmPassword?.message}
              >
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={getInputClassName(!!errors.confirmPassword)}
                />
              </FormFieldWrapper>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="h-10 px-6 text-sm font-semibold"
                size="sm"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar Master'}
              </Button>
            </div>
          </form>
        </div>
      </PageContainer>
    </MasterOnly>
  )
}


