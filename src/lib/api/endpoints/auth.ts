import { apiClient } from '../api-client'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
    role: 'master' | 'admin' | 'manager' | 'executor' | 'consultant'
  }
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface RegisterResponse {
  id: string
  email: string
  name: string
  role: string
}

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>('/auth/register', data),

  me: () =>
    apiClient.get<LoginResponse['user']>('/auth/me'),

  logout: () =>
    apiClient.post<void>('/auth/logout'),
}
