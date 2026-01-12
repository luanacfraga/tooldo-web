'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { useCompanies } from '@/lib/services/queries/use-companies'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useCompanyStore } from '@/lib/stores/company-store'
import { getCompaniesWithRoles, type CompanyWithRole } from '@/lib/utils/user-role'

import type { UserRole } from '@/lib/permissions'

interface UserContextValue {
  user: {
    id: string
    email: string
    name: string
    globalRole: UserRole
    companies: CompanyWithRole[]
  } | null
  currentCompanyId: string | null
  currentRole: UserRole | null
  isAuthenticated: boolean
  isLoadingCompanies: boolean
  setCurrentCompanyId: (companyId: string | null) => void
  refreshCompanies: () => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const { user: authUser, isAuthenticated: authIsAuthenticated, initAuth } = useAuthStore()
  const { selectedCompany, setCompanies, selectCompany } = useCompanyStore()
  const { data: companies = [], refetch, isLoading: isLoadingCompanies } = useCompanies()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const [currentCompanyId, setCurrentCompanyIdState] = useState<string | null>(
    selectedCompany?.id || null
  )

  useEffect(() => {
    if (authIsAuthenticated && companies.length > 0) {
      setCompanies(companies)
    }
  }, [authIsAuthenticated, companies, setCompanies])

  useEffect(() => {
    if (selectedCompany?.id !== currentCompanyId) {
      console.log('[UserContext] Syncing currentCompanyId with selectedCompany:', {
        from: currentCompanyId,
        to: selectedCompany?.id || null,
      })
      setCurrentCompanyIdState(selectedCompany?.id || null)
    }
  }, [selectedCompany, currentCompanyId])

  const setCurrentCompanyId = useCallback(
    (companyId: string | null) => {
      setCurrentCompanyIdState(companyId)
      const company = companies.find((c) => c.id === companyId)
      if (company) {
        selectCompany(company)
      } else {
        selectCompany(null)
      }
    },
    [companies, selectCompany]
  )

  const companiesWithRoles = useMemo<CompanyWithRole[]>(() => {
    return getCompaniesWithRoles(companies, authUser)
  }, [authUser, companies])

  const currentRole = useMemo<UserRole | null>(() => {
    if (!authUser) return null
    if (!currentCompanyId) return authUser.role as UserRole

    const companyWithRole = companiesWithRoles.find((c) => c.id === currentCompanyId)
    return companyWithRole?.role || authUser.role
  }, [authUser, currentCompanyId, companiesWithRoles])

  const value: UserContextValue = useMemo(
    () => ({
      user: authUser
        ? {
            id: authUser.id,
            email: authUser.email,
            name: authUser.name,
            globalRole: authUser.role as UserRole,
            companies: companiesWithRoles,
          }
        : null,
      currentCompanyId,
      currentRole,
      isAuthenticated: authIsAuthenticated,
      isLoadingCompanies,
      setCurrentCompanyId,
      refreshCompanies: () => {
        refetch()
      },
    }),
    [
      authUser,
      authIsAuthenticated,
      currentCompanyId,
      currentRole,
      companiesWithRoles,
      refetch,
      setCurrentCompanyId,
      isLoadingCompanies,
    ]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUserContext() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return context
}
