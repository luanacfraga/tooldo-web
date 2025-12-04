'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { Building2 } from 'lucide-react'

import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { PageContainer } from '@/components/shared/layout/page-container'
import { EmptyState } from '@/components/shared/feedback/empty-state'

import { useUserContext } from '@/lib/contexts/user-context'
import { calculateCompanyNavigation } from '@/lib/utils/company-navigation'

interface CompanyLayoutProps {
  children: ReactNode
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const { user, currentCompanyId, setCurrentCompanyId, currentRole } = useUserContext()
  const companyId = params.companyId as string

  useEffect(() => {
    if (!user) return

    const navigation = calculateCompanyNavigation({
      companyId,
      currentCompanyId,
      companies: user.companies,
      userGlobalRole: user.globalRole,
    })

    if (navigation.shouldUpdateCompanyId) {
      setCurrentCompanyId(companyId)
      return
    }

    if (navigation.shouldRedirectToSelectCompany && navigation.redirectPath) {
      router.push(navigation.redirectPath)
      return
    }

    if (navigation.shouldRedirectToFirstCompany && navigation.redirectPath) {
      router.push(navigation.redirectPath)
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
                    label: 'Gerenciar Empresas',
                    onClick: () => router.push('/companies'),
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
                  label: 'Gerenciar Empresas',
                  onClick: () => router.push('/companies'),
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

