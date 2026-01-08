'use client'

import { ActionFilters } from '@/components/features/actions/action-list/action-filters'
import { ActionListContainer } from '@/components/features/actions/action-list/action-list-container'
import { ActionListSkeleton } from '@/components/features/actions/action-list/action-list-skeleton'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export default function ActionsPage() {
  const { user } = useAuth()
  const canCreate = user?.role === 'admin' || user?.role === 'manager'

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Ações"
        description="Gerencie e acompanhe o progresso das suas tarefas"
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/actions/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Ação
              </Link>
            </Button>
          ) : null
        }
      />

      <div className="space-y-6">
        <ActionFilters />
        <div className="-mx-4 sm:mx-0">
          <Suspense fallback={<ActionListSkeleton />}>
            <ActionListContainer />
          </Suspense>
        </div>
      </div>
    </PageContainer>
  )
}
