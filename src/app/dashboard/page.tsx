'use client'

import { BaseLayout } from '@/components/layout/base-layout'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { useAuthStore } from '@/lib/stores/auth-store'

export default function DashboardPage() {
  const { user } = useAuthStore()

  return (
    <BaseLayout sidebar={<DashboardSidebar />}>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
          </h1>
        </div>
      </div>
    </BaseLayout>
  )
}
