import { apiClient } from '../api-client'
import { PaginatedResponse, PaginationParams } from '../types'

export interface User {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  role: 'master' | 'admin' | 'manager' | 'executor' | 'consultant'
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

export interface AvatarColorsResponse {
  colors: readonly string[]
}

export interface UpdateAvatarColorRequest {
  avatarColor: string
}

export interface UpdateProfileRequest {
  phone?: string
  firstName?: string
  lastName?: string
}

export const usersApi = {
  getAll: (params?: PaginationParams & { role?: User['role'] }) =>
    apiClient.get<PaginatedResponse<User>>('/api/v1/users', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),

  getById: (id: string) => apiClient.get<User>(`/users/${id}`),

  create: (data: CreateUserRequest) => apiClient.post<User>('/users', data),

  update: (id: string, data: UpdateUserRequest) => apiClient.put<User>(`/users/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/users/${id}`),

  getAvatarColors: () => apiClient.get<AvatarColorsResponse>('/api/v1/users/me/avatar-colors'),

  updateAvatarColor: (data: UpdateAvatarColorRequest) =>
    apiClient.patch<User>('/api/v1/users/me/avatar-color', data),

  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.patch<User>('/api/v1/users/me/profile', data),
}
