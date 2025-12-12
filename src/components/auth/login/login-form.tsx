'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FormFieldWrapper } from '@/components/ui/form-field-wrapper'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'

import { useAuth } from '@/lib/hooks/use-auth'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { getInputClassName } from '@/lib/utils/form-styles'
import { loginSchema, type LoginFormData } from '@/lib/validators/auth'

import { ErrorAlert } from './error-alert'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const { login, isLoading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null)
      await login(data.email, data.password)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Email ou senha inválidos'))
    }
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

        <FormFieldWrapper label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            className={getInputClassName(!!errors.email)}
          />
        </FormFieldWrapper>

        <FormFieldWrapper
          label="Senha"
          htmlFor="password"
          error={errors.password?.message}
          labelAction={
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary transition-all hover:text-primary/80 active:scale-95"
            >
              Esqueceu?
            </Link>
          }
        >
          <PasswordInput
            id="password"
            placeholder="••••••••"
            {...register('password')}
            className={getInputClassName(!!errors.password)}
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
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              Entrando...
            </span>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      <div className="mt-8 border-t border-border/50 pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="font-semibold text-primary transition-all hover:text-primary/80 hover:underline active:scale-95"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
