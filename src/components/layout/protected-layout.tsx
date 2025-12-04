'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import Cookies from 'js-cookie'

import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { BaseLayout } from './base-layout'
import { DashboardSidebar } from './dashboard-sidebar'

import { useUserContext } from '@/lib/contexts/user-context'
import { config } from '@/config/config'

interface ProtectedLayoutProps {
  children: ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, user } = useUserContext()
  const router = useRouter()
  const pathname = usePathname()
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrating(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isHydrating && !isAuthenticated && !user) {
      const token = Cookies.get(config.cookies.tokenName)
      if (!token) {
        router.push('/login')
      }
    }
  }, [isHydrating, isAuthenticated, user, router])

  if (isHydrating || !isAuthenticated || !user) {
    return <LoadingScreen message="Verificando autenticação..." />
  }

  return (
    <BaseLayout sidebar={<DashboardSidebar />}>
      {children}
    </BaseLayout>
  )
}

