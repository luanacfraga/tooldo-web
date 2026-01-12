import type { Company } from '@/lib/api/endpoints/companies'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CompanyState {
  companies: Company[]
  selectedCompany: Company | null
  isLoading: boolean

  setCompanies: (companies: Company[]) => void
  selectCompany: (company: Company | null) => void
  addCompany: (company: Company) => void
  updateCompany: (id: string, updates: Partial<Company>) => void
  removeCompany: (id: string) => void
  setLoading: (isLoading: boolean) => void
  clearCompanies: () => void
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      selectedCompany: null,
      isLoading: false,

      setCompanies: (companies) => {
        const { selectedCompany } = get()
        console.log('[CompanyStore] setCompanies called:', {
          companiesCount: companies.length,
          currentSelectedCompany: selectedCompany?.id,
        })

        set({ companies })

        if (!selectedCompany && companies.length > 0) {
          console.log('[CompanyStore] Auto-selecting first company:', companies[0].id)
          set({ selectedCompany: companies[0] })
        }

        if (selectedCompany && !companies.find((c) => c.id === selectedCompany.id)) {
          console.log('[CompanyStore] Selected company not in list - changing selection:', {
            was: selectedCompany.id,
            changingTo: companies[0]?.id || null,
          })
          set({ selectedCompany: companies[0] || null })
        }
      },

      selectCompany: (company) => {
        console.log('[CompanyStore] selectCompany called:', {
          companyId: company?.id || null,
        })
        set({ selectedCompany: company })
      },

      addCompany: (company) => {
        const { companies } = get()
        set({ companies: [...companies, company] })

        if (companies.length === 0) {
          set({ selectedCompany: company })
        }
      },

      updateCompany: (id, updates) => {
        const { companies, selectedCompany } = get()
        const updatedCompanies = companies.map((c) => (c.id === id ? { ...c, ...updates } : c))
        set({ companies: updatedCompanies })

        if (selectedCompany?.id === id) {
          set({ selectedCompany: { ...selectedCompany, ...updates } })
        }
      },

      removeCompany: (id) => {
        const { companies, selectedCompany } = get()
        const filteredCompanies = companies.filter((c) => c.id !== id)
        set({ companies: filteredCompanies })

        if (selectedCompany?.id === id) {
          set({ selectedCompany: filteredCompanies[0] || null })
        }
      },

      setLoading: (isLoading) => {
        set({ isLoading })
      },

      clearCompanies: () => {
        set({
          companies: [],
          selectedCompany: null,
          isLoading: false,
        })
      },
    }),
    {
      name: 'company-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedCompany: state.selectedCompany,
      }),
    }
  )
)
