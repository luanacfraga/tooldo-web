import { employeesApi } from '@/lib/api/endpoints/employees'
import type { PaginationParams } from '@/lib/api/types'
import type { InviteEmployeeRequest } from '@/lib/types/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const EMPLOYEES_KEY = ['employees'] as const

interface UseEmployeesParams extends PaginationParams {
  status?: string
}

export function useEmployeesByCompany(companyId: string, params?: UseEmployeesParams) {
  return useQuery({
    queryKey: [
      ...EMPLOYEES_KEY,
      'company',
      companyId,
      params?.status,
      params?.page,
      params?.limit,
      params?.sortBy,
      params?.sortOrder,
    ],
    queryFn: async () => {
      const response = await employeesApi.listByCompany(companyId, params)
      return response || { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }
    },
    enabled: !!companyId,
  })
}

export function useInviteEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteEmployeeRequest) => employeesApi.invite(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...EMPLOYEES_KEY, 'company', variables.companyId],
      })
    },
  })
}

export function useSuspendEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
    },
  })
}

export function useActivateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
    },
  })
}

export function useRemoveEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => employeesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEES_KEY })
    },
  })
}
