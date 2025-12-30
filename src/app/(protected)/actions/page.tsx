import { ActionFilters } from '@/components/features/actions/action-list/action-filters'
import { ActionListContainer } from '@/components/features/actions/action-list/action-list-container'
import { ActionListHeader } from '@/components/features/actions/action-list/action-list-header'
import { ActionListSkeleton } from '@/components/features/actions/action-list/action-list-skeleton'
import { PageContainer } from '@/components/shared/layout/page-container'
import { Suspense } from 'react'

export default function ActionsPage() {
  return (
    <PageContainer>
      <div className="space-y-6">
        <ActionListHeader />
        <ActionFilters />
        <Suspense fallback={<ActionListSkeleton />}>
          <ActionListContainer />
        </Suspense>
      </div>
    </PageContainer>
  )
}
