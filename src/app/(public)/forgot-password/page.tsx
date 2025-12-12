'use client'

import { ForgotPasswordForm } from '@/components/auth/forgot-password/forgot-password-form'
import { PageHeaderAuth } from '@/components/shared/layout/page-header-auth'

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHeaderAuth
        title="Esqueceu sua senha?"
        description="Digite seu email e enviaremos um link para redefinir sua senha"
      />
      <ForgotPasswordForm />
    </>
  )
}
