import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyFiltersState {
  // Filter values
  query: string;
  page: number;
  pageSize: number;

  // Actions
  setFilter: <K extends keyof CompanyFiltersState>(key: K, value: CompanyFiltersState[K]) => void;
  resetFilters: () => void;
}

const initialState = {
  query: '',
  page: 1,
  pageSize: 20,
};

export const useCompanyFiltersStore = create<CompanyFiltersState>()(
  persist(
    (set) => ({
      ...initialState,

      setFilter: (key, value) => {
        set((state) => ({
          ...state,
          [key]: value,
          // Reset page when filters change (except page and pageSize)
          page: key !== 'page' && key !== 'pageSize' ? 1 : state.page,
        }));
      },

      resetFilters: () => {
        set(initialState);
      },
    }),
    {
      name: 'company-filters-storage',
      partialize: (state) => ({
        pageSize: state.pageSize,
      }),
    }
  )
);
