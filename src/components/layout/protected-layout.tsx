'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { useUserContext } from '@/lib/contexts/user-context'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { BaseLayout } from './base-layout'
import { DashboardSidebar } from './dashboard-sidebar'

interface ProtectedLayoutProps {
  children: ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, user } = useUserContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return <LoadingScreen message="Verificando autenticação..." />
  }

  const isSelectCompanyPage = pathname === '/select-company'
  const isCompaniesNewPage = pathname === '/companies/new'

  if (isSelectCompanyPage || isCompaniesNewPage) {
    return <>{children}</>
  }

  return (
    <BaseLayout sidebar={<DashboardSidebar />}>
      {children}
    </BaseLayout>
  )
}

