import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompanyFiltersState {
  query: string;
  page: number;
  pageSize: number;

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
