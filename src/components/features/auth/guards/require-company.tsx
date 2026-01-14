'use client'

import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { Button } from '@/components/ui/button'
import { useAuthGuard } from '@/lib/hooks/auth/use-auth-guard'
import { useCompanyStore } from '@/lib/stores/company-store'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface RequireCompanyProps {
  children: React.ReactNode
}

export function RequireCompany({ children }: RequireCompanyProps) {
  const router = useRouter()
  const { isChecking, user } = useAuthGuard()
  const selectedCompany = useCompanyStore((state) => state.selectedCompany)
  const { isAdmin } = usePermissions()

  useEffect(() => {
    console.log('[RequireCompany] Effect triggered:', {
      isChecking,
      userRole: user?.role,
      selectedCompany: selectedCompany?.id,
      willRedirect: !isChecking && isAdmin && !selectedCompany,
    })

    if (!isChecking && isAdmin && !selectedCompany) {
      console.log('[RequireCompany] Redirecting admin to /companies - no selected company')
      router.push('/companies')
    }
  }, [isChecking, user, selectedCompany, router, isAdmin])

  if (isChecking || !user) {
    return <LoadingScreen />
  }

  if (isAdmin && !selectedCompany) {
    return <CompanySelectionPrompt onNavigate={() => router.push('/companies')} />
  }

  return <>{children}</>
}

function CompanySelectionPrompt({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-lightest/30 via-background to-secondary-lightest/30 p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-lightest">
          <Building2 className="h-10 w-10 text-primary-base" />
        </div>
        <h2 className="text-2xl font-bold">Selecione uma Empresa</h2>
        <p className="mt-3 text-muted-foreground">
          Para continuar, você precisa selecionar qual empresa deseja administrar.
        </p>
        <Button onClick={onNavigate} className="mt-6" size="lg">
          Selecionar Empresa
        </Button>
      </div>
    </div>
  )
}
