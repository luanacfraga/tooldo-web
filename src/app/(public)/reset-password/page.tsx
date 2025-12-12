'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageHeaderAuth } from '@/components/shared/layout/page-header-auth'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { ResetPasswordForm } from '@/components/auth/reset-password/reset-password-form'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  if (!token) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Token inválido</CardTitle>
          <CardDescription className="mt-2">
            O link de redefinição de senha é inválido ou expirou. Solicite um novo link.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <PageHeaderAuth title="Redefinir senha" description="Digite sua nova senha abaixo" />
      <ResetPasswordForm token={token} />
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Carregando..." />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
