'use client'

import { ActionFilters } from '@/components/features/actions/action-list/action-filters'
import { ActionListContainer } from '@/components/features/actions/action-list/action-list-container'
import { ActionListSkeleton } from '@/components/features/actions/action-list/action-list-skeleton'
import { ActionDialog } from '@/components/features/actions/action-dialog'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { useActionDialogStore } from '@/lib/stores/action-dialog-store'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'

export default function ActionsPage() {
  const { user } = useAuth()
  const { openCreate } = useActionDialogStore()
  const { isAdmin, isManager } = usePermissions()
  const canCreate = isAdmin || isManager

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Ações"
        description="Gerencie e acompanhe o progresso das suas tarefas"
        action={
          canCreate ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ação
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

      <ActionDialog />
    </PageContainer>
  )
}
