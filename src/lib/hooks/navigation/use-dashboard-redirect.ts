import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { useUserContext } from '@/lib/contexts/user-context'

export function useDashboardRedirect() {
  const router = useRouter()
  const { user, currentCompanyId } = useUserContext()

  useEffect(() => {
    if (!user) return

    if (currentCompanyId) {
      router.replace(`/companies/${currentCompanyId}/dashboard`)
      return
    }

    if (user.companies.length > 0) {
      router.replace(`/companies/${user.companies[0].id}/dashboard`)
      return
    }

    if (user.globalRole === 'admin') {
      router.replace('/companies')
    }
  }, [user, currentCompanyId, router])
}

