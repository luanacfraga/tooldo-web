import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'

export interface Plan {
  id: string
  name: string
  description: string | null
  price: number
  maxCompanies: number
  maxManagers: number
  maxExecutors: number
  maxConsultants: number
  iaCallsLimit: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePlanRequest {
  name: string
  description?: string
  price: number
  maxCompanies: number
  maxManagers: number
  maxExecutors: number
  maxConsultants: number
  iaCallsLimit: number
  isActive?: boolean
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

export const plansApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Plan>>('/plans', {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  getById: (id: string) =>
    apiClient.get<Plan>(`/plans/${id}`),

  create: (data: CreatePlanRequest) =>
    apiClient.post<Plan>('/plans', data),

  update: (id: string, data: UpdatePlanRequest) =>
    apiClient.put<Plan>(`/plans/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/plans/${id}`),
}
