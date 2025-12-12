'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormFieldWrapper } from '@/components/ui/form-field-wrapper'
import { PasswordInput } from '@/components/ui/password-input'

import { authApi } from '@/lib/api/endpoints/auth'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { getInputClassName } from '@/lib/utils/form-styles'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validators/auth'

import { ErrorAlert } from '../login/error-alert'

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setError(null)
      setIsLoading(true)
      await authApi.resetPassword({
        token,
        password: data.password,
      })
      setSuccess(true)
      const REDIRECT_DELAY_MS = 2000
      setTimeout(() => {
        router.push('/login')
      }, REDIRECT_DELAY_MS)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Erro ao redefinir senha'))
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-lightest">
            <CheckCircle2 className="h-8 w-8 text-success-base" />
          </div>
          <CardTitle className="text-xl">Senha redefinida!</CardTitle>
          <CardDescription className="mt-2">
            Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full" variant="outline">
            <Link href="/login">Ir para login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
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

        <FormFieldWrapper label="Nova senha" htmlFor="password" error={errors.password?.message}>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register('password')}
            className={getInputClassName(!!errors.password)}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Confirmar nova senha"
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

        <Button
          type="submit"
          className="mt-8 h-12 w-full text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:brightness-105 active:scale-[0.98]"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2.5">
              <Loader2 className="h-5 w-5 animate-spin" />
              Redefinindo...
            </span>
          ) : (
            'Redefinir senha'
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-border/50 pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Lembrou sua senha?{' '}
          <Link
            href="/login"
            className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline active:scale-95"
          >
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  )
}
