import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'
import type { Employee, InviteEmployeeRequest } from '@/lib/types/api'

interface AcceptInviteRequest {
  token: string
  password: string
  document?: string
}

export const employeesApi = {
  invite: (data: InviteEmployeeRequest) =>
    apiClient.post<Employee>('/api/v1/employees/invite', data),

  acceptInvite: (data: AcceptInviteRequest) =>
    apiClient.post<Employee>('/api/v1/employees/accept-invite-by-token', data),

  listByCompany: (companyId: string, params?: PaginationParams & { status?: string }) =>
    apiClient.get<PaginatedResponse<Employee>>(`/api/v1/employees/company/${companyId}`, {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  suspend: (id: string) =>
    apiClient.put<Employee>(`/api/v1/employees/${id}/suspend`),

  activate: (id: string) =>
    apiClient.put<Employee>(`/api/v1/employees/${id}/activate`),

  remove: (id: string) =>
    apiClient.delete<Employee>(`/api/v1/employees/${id}`),
}

export type { Employee, InviteEmployeeRequest }
