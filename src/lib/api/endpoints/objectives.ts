import { apiClient } from '../api-client'

export interface Objective {
  id: string
  companyId: string
  teamId: string
  title: string
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateObjectiveRequest {
  companyId: string
  teamId: string
  title: string
  dueDate?: string | null
}

export interface UpdateObjectiveRequest {
  title?: string
  dueDate?: string | null
}

export const objectivesApi = {
  listByTeam: (companyId: string, teamId: string) =>
    apiClient.get<Objective[]>('/api/v1/objectives', {
      params: { companyId, teamId },
    }),

  create: (data: CreateObjectiveRequest) =>
    apiClient.post<Objective>('/api/v1/objectives', data),

  update: (id: string, data: UpdateObjectiveRequest) =>
    apiClient.put<Objective>(`/api/v1/objectives/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/api/v1/objectives/${id}`),
}


