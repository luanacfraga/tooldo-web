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
    // Com Zustand v5, a reidratação do persist acontece de forma síncrona
    // na primeira leitura do store no cliente, então podemos simplesmente
    // marcar como hidratado após o primeiro render no client.
    setHasHydrated(true)
  }, [])

  useEffect(() => {
    if (!hasHydrated) return

    const token = Cookies.get(config.cookies.tokenName)

    // Sem token: não existe sessão, redireciona.
    if (!token) {
      router.replace('/login')
      return
    }

    // Token existe mas não temos usuário autenticado após hidratação:
    // estado inconsistente -> limpa sessão local e redireciona.
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
