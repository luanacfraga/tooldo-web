import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'

export interface Team {
  id: string
  name: string
  companyId: string
  managerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTeamRequest {
  name: string
  companyId: string
  managerId: string
}

export interface UpdateTeamRequest {
  name?: string
  managerId?: string
}

export const teamsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Team>>('/teams', {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  getById: (id: string) =>
    apiClient.get<Team>(`/teams/${id}`),

  getByCompany: (companyId: string, params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Team>>(`/companies/${companyId}/teams`, {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  create: (data: CreateTeamRequest) =>
    apiClient.post<Team>('/teams', data),

  update: (id: string, data: UpdateTeamRequest) =>
    apiClient.put<Team>(`/teams/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/teams/${id}`),
}
