import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'

export interface User {
  id: string
  email: string
  name: string
  role: 'master' | 'admin' | 'manager' | 'executor' | 'consultant'
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  name: string
  password: string
  role: User['role']
}

export interface UpdateUserRequest {
  email?: string
  name?: string
  password?: string
  role?: User['role']
}

export const usersApi = {
  getAll: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', {
      params: params as Record<string, string | number | boolean | undefined>
    }),

  getById: (id: string) =>
    apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    apiClient.post<User>('/users', data),

  update: (id: string, data: UpdateUserRequest) =>
    apiClient.put<User>(`/users/${id}`, data),

  delete: (id: string) =>
    apiClient.delete<void>(`/users/${id}`),
}
