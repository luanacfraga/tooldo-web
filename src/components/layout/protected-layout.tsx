'use client'

import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { BaseLayout } from './base-layout'
import { DashboardSidebar } from './dashboard-sidebar'

import { config } from '@/config/config'
import { useUserContext } from '@/lib/contexts/user-context'
import { useAuthStore } from '@/lib/stores/auth-store'

interface ProtectedLayoutProps {
  children: ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, user } = useUserContext()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) return

    const token = Cookies.get(config.cookies.tokenName)

    if (!token) {
      router.replace('/login')
      return
    }

    if (!user || !isAuthenticated) {
      logout()
      router.replace('/login')
    }
  }, [hasHydrated, isAuthenticated, user, router, logout])

  if (!hasHydrated) {
    return <LoadingScreen icon="logo" message="Carregando sessão..." />
  }

  if (!isAuthenticated || !user) {
    return <LoadingScreen icon="logo" message="Redirecionando..." />
  }

  return <BaseLayout sidebar={<DashboardSidebar />}>{children}</BaseLayout>
}
