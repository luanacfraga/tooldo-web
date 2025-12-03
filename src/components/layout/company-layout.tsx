'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { useUserContext } from '@/lib/contexts/user-context'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { Building2 } from 'lucide-react'

interface CompanyLayoutProps {
  children: ReactNode
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const { user, currentCompanyId, setCurrentCompanyId, currentRole } = useUserContext()
  const companyId = params.companyId as string

  useEffect(() => {
    if (companyId && companyId !== currentCompanyId) {
      const company = user?.companies.find((c) => c.id === companyId)
      if (company) {
        setCurrentCompanyId(companyId)
      } else if (user?.companies.length === 0) {
        if (user?.globalRole === 'admin') {
          router.push('/select-company')
        }
      } else if (user?.companies.length > 0) {
        router.push(`/companies/${user.companies[0].id}/dashboard`)
      }
    }
  }, [companyId, currentCompanyId, user, setCurrentCompanyId, router])

  if (!user) {
    return <LoadingScreen message="Carregando..." />
  }

  if (!companyId) {
    if (user.companies.length === 0) {
      return (
        <PageContainer maxWidth="4xl">
          <EmptyState
            icon={Building2}
            title="Nenhuma empresa encontrada"
            description="Você precisa estar associado a uma empresa para acessar esta área."
            action={
              user.globalRole === 'admin'
                ? {
                    label: 'Selecionar Empresa',
                    onClick: () => router.push('/select-company'),
                  }
                : undefined
            }
          />
        </PageContainer>
      )
    }

    return <LoadingScreen message="Redirecionando..." />
  }

  const company = user.companies.find((c) => c.id === companyId)

  if (!company) {
    const isAdmin = user.globalRole === 'admin'
    return (
      <PageContainer maxWidth="4xl">
        <EmptyState
          icon={Building2}
          title="Empresa não encontrada"
          description="Você não tem acesso a esta empresa ou ela não existe."
          action={
            isAdmin
              ? {
                  label: 'Selecionar Empresa',
                  onClick: () => router.push('/select-company'),
                }
              : user.companies.length > 0
                ? {
                    label: 'Ir para minha empresa',
                    onClick: () => router.push(`/companies/${user.companies[0].id}/dashboard`),
                  }
                : undefined
          }
        />
      </PageContainer>
    )
  }

  if (!currentRole) {
    return <LoadingScreen message="Carregando permissões..." />
  }

  return <>{children}</>
}

