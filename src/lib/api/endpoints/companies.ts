import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'

export interface Company {
  id: string
  name: string
  adminId: string
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyRequest {
  name: string
  adminId: string
}

export interface UpdateCompanyRequest {
  name?: string
}

export const companiesApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Company>>('/companies', {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  getById: (id: string) =>
    apiClient.get<Company>(`/companies/${id}`),

  create: (data: CreateCompanyRequest) =>
    apiClient.post<Company>('/companies', data),

  update: (id: string, data: UpdateCompanyRequest) =>
    apiClient.put<Company>(`/companies/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/companies/${id}`),
}
