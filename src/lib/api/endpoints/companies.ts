import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'
import type { Company, CreateCompanyRequest, UpdateCompanyRequest, Employee } from '@/lib/types/api'
import type { ExecutorDashboardResponse } from '@/lib/types/executor-dashboard'

export interface CompanySettings {
  company: {
    id: string
    name: string
    description: string | null
    adminId: string
    document: string
    documentType: 'CPF' | 'CNPJ'
  }
  admin: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    document: string
    documentType: 'CPF' | 'CNPJ'
    role: string
  }
  plan: {
    id: string
    name: string
    maxCompanies: number
    maxManagers: number
    maxExecutors: number
    maxConsultants: number
    iaCallsLimit: number
  }
  subscription: {
    id: string
    adminId: string
    planId: string
    startedAt: string
    isActive: boolean
  }
}

export const companiesApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Company>>('/api/v1/companies', {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  getMyCompanies: () =>
    apiClient.get<Company[]>('/api/v1/companies/me'),

  getByAdmin: (adminId: string) =>
    apiClient.get<Company[]>(`/api/v1/companies/admin/${adminId}`),

  getById: (id: string) =>
    apiClient.get<Company>(`/api/v1/companies/${id}`),

  getSettings: (id: string) =>
    apiClient.get<CompanySettings>(`/api/v1/companies/${id}/settings`),

  listResponsibles: (id: string) =>
    apiClient.get<Employee[]>(`/api/v1/companies/${id}/responsibles`),

  create: (data: CreateCompanyRequest) =>
    apiClient.post<Company>('/api/v1/companies', data),

  update: (id: string, data: UpdateCompanyRequest) =>
    apiClient.put<Company>(`/api/v1/companies/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/api/v1/companies/${id}`),

  getExecutorDashboard: (
    companyId: string,
    params: { dateFrom: string; dateTo: string; objective?: string }
  ) =>
    apiClient.get<ExecutorDashboardResponse>(`/api/v1/companies/${companyId}/executor-dashboard`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),
}

export type { Company, CreateCompanyRequest, UpdateCompanyRequest }
