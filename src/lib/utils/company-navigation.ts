import type { UserRole } from '@/lib/permissions'
import type { CompanyWithRole } from '@/lib/utils/user-role'

interface CompanyNavigationParams {
  companyId: string | null
  currentCompanyId: string | null
  companies: CompanyWithRole[]
  userGlobalRole: UserRole
}

interface CompanyNavigationResult {
  shouldUpdateCompanyId: boolean
  shouldRedirectToSelectCompany: boolean
  shouldRedirectToFirstCompany: boolean
  redirectPath?: string
}

export function calculateCompanyNavigation(
  params: CompanyNavigationParams
): CompanyNavigationResult {
  const { companyId, currentCompanyId, companies, userGlobalRole } = params

  if (!companyId || companyId === currentCompanyId) {
    return {
      shouldUpdateCompanyId: false,
      shouldRedirectToSelectCompany: false,
      shouldRedirectToFirstCompany: false,
    }
  }

  const company = companies.find((c) => c.id === companyId)

  if (company) {
    return {
      shouldUpdateCompanyId: true,
      shouldRedirectToSelectCompany: false,
      shouldRedirectToFirstCompany: false,
    }
  }

  if (companies.length === 0) {
    return {
      shouldUpdateCompanyId: false,
      shouldRedirectToSelectCompany: userGlobalRole === 'admin',
      shouldRedirectToFirstCompany: false,
      redirectPath: userGlobalRole === 'admin' ? '/companies' : undefined,
    }
  }

  const currentCompanyExists = companies.some((c) => c.id === companyId)

  if (!currentCompanyExists) {
    return {
      shouldUpdateCompanyId: false,
      shouldRedirectToSelectCompany: false,
      shouldRedirectToFirstCompany: true,
      redirectPath: `/companies/${companies[0].id}/dashboard`,
    }
  }

  return {
    shouldUpdateCompanyId: false,
    shouldRedirectToSelectCompany: false,
    shouldRedirectToFirstCompany: false,
  }
}

