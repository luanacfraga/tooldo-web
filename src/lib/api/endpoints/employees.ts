import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'

export interface Employee {
  id: string
  userId: string
  companyId: string
  role: 'manager' | 'executor' | 'consultant'
  status: 'INVITED' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED' | 'REMOVED'
  position?: string
  notes?: string
  invitedAt?: string
  acceptedAt?: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    role: string
  }
}

export interface InviteEmployeeRequest {
  companyId: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  document?: string
  role: 'manager' | 'executor' | 'consultant'
  position?: string
  notes?: string
}

export interface AcceptInviteRequest {
  token: string
  password: string
  phone?: string
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

