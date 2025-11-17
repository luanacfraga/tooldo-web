export { apiClient, ApiError } from './api-client'
export * from './types'

// Endpoint APIs
export { authApi } from './endpoints/auth'
export { plansApi } from './endpoints/plans'
export { companiesApi } from './endpoints/companies'
export { usersApi } from './endpoints/users'
export { teamsApi } from './endpoints/teams'

// Re-export types from endpoints
export type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from './endpoints/auth'
export type { Plan, CreatePlanRequest, UpdatePlanRequest } from './endpoints/plans'
export type { Company, CreateCompanyRequest, UpdateCompanyRequest } from './endpoints/companies'
export type { User, CreateUserRequest, UpdateUserRequest } from './endpoints/users'
export type { Team, CreateTeamRequest, UpdateTeamRequest } from './endpoints/teams'
