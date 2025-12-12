'use client'

import { ErrorAlert } from '@/components/auth/login/error-alert'
import { Button } from '@/components/ui/button'
import { FormFieldWrapper } from '@/components/ui/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { ApiError } from '@/lib/api/api-client'
import { employeesApi } from '@/lib/api/endpoints/employees'
import { maskCPF, unmaskCPF } from '@/lib/utils/masks'
import { acceptInviteSchema, type AcceptInviteFormData } from '@/lib/validators/employee'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

function AcceptInviteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [cpfValue, setCpfValue] = useState('')

  const token = searchParams.get('token') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      token: token,
      password: '',
      confirmPassword: '',
      document: '',
    },
  })

  useEffect(() => {
    if (token) {
      setValue('token', token)
    }
  }, [token, setValue])

  const onSubmit = async (data: AcceptInviteFormData) => {
    try {
      setError(null)
      setIsLoading(true)

      await employeesApi.acceptInvite({
        token: data.token,
        password: data.password,
        document: data.document ? unmaskCPF(data.document) : undefined,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push('/login?accepted=true')
      }, 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data as { message?: string }
        const errorMessage = errorData?.message || 'Erro ao aceitar convite. Tente novamente.'
        setError(errorMessage)
      } else {
        setError('Erro ao aceitar convite. Tente novamente.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="relative animate-fade-in rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Token inválido</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                O link de convite é inválido ou expirou.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-semibold text-primary transition-all hover:text-primary/80 hover:underline"
              >
                Voltar para login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="relative animate-fade-in rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <svg
                  className="h-8 w-8 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">Convite aceito!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sua conta foi ativada com sucesso. Redirecionando para o login...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Aceitar Convite</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete seu cadastro para ativar sua conta
          </p>
        </div>

        <div className="relative animate-fade-in rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
          <form
            method="POST"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(onSubmit)(e)
            }}
            className="space-y-6"
          >
            {error && <ErrorAlert message={error} />}

            <FormFieldWrapper label="CPF" htmlFor="document" error={errors.document?.message}>
              <Input
                id="document"
                type="text"
                placeholder="000.000.000-00"
                value={cpfValue}
                onChange={(e) => {
                  const masked = maskCPF(e.target.value)
                  setCpfValue(masked)
                  setValue('document', unmaskCPF(masked), { shouldValidate: true })
                }}
                className={`h-12 text-base transition-all ${
                  errors.document
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
                }`}
              />
            </FormFieldWrapper>

            <FormFieldWrapper label="Senha" htmlFor="password" error={errors.password?.message}>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...register('password')}
                className={`h-12 text-base transition-all ${
                  errors.password
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
                }`}
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
                className={`h-12 text-base transition-all ${
                  errors.confirmPassword
                    ? 'border-destructive focus-visible:ring-destructive'
                    : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
                }`}
              />
            </FormFieldWrapper>

            <input type="hidden" {...register('token')} />

            <Button
              type="submit"
              className="mt-8 h-12 w-full text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:brightness-105 active:scale-[0.98]"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2.5">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Aceitando convite...
                </span>
              ) : (
                'Aceitar Convite'
              )}
            </Button>
          </form>

          <div className="mt-8 border-t border-border/50 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline active:scale-95"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
          <div className="w-full max-w-md">
            <div className="relative animate-fade-in rounded-3xl border border-border/60 bg-card/95 p-6 shadow-2xl backdrop-blur-xl transition-all sm:p-8 lg:rounded-2xl lg:bg-card lg:shadow-lg">
              <div className="text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <p className="text-sm text-muted-foreground">Carregando...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <AcceptInviteForm />
    </Suspense>
  )
}
