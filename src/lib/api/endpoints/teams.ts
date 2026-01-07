import type { Employee } from '@/lib/types/api'
import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'

export interface Team {
  id: string
  name: string
  description?: string | null
  iaContext?: string | null
  companyId: string
  managerId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTeamRequest {
  name: string
  companyId: string
  managerId: string
  description?: string
  iaContext?: string
}

export interface UpdateTeamRequest {
  name?: string
  managerId?: string
  description?: string
  iaContext?: string
}

export interface TeamMember {
  id: string
  teamId: string
  userId: string
}

export interface AddTeamMemberRequest {
  userId: string
}

export const teamsApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<Team>>('/api/v1/teams', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getById: (id: string) => apiClient.get<Team>(`/api/v1/teams/${id}`),

  getByCompany: (companyId: string, params?: PaginationParams) =>
    apiClient.get<Team[]>(`/api/v1/teams/company/${companyId}`, {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  create: (data: CreateTeamRequest) => apiClient.post<Team>('/api/v1/teams', data),

  update: (id: string, data: UpdateTeamRequest) => apiClient.put<Team>(`/api/v1/teams/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/api/v1/teams/${id}`),

  listMembers: (teamId: string) => apiClient.get<TeamMember[]>(`/api/v1/teams/${teamId}/members`),

  addMember: (teamId: string, data: AddTeamMemberRequest) =>
    apiClient.post<TeamMember>(`/api/v1/teams/${teamId}/members`, data),

  removeMember: (teamId: string, memberId: string) =>
    apiClient.delete<void>(`/api/v1/teams/${teamId}/members/${memberId}`),

  listAvailableExecutors: (teamId: string) =>
    apiClient.get<Employee[]>(`/api/v1/teams/${teamId}/available-executors`),
}
