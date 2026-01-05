// Common API types

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage?: boolean
    hasPreviousPage?: boolean
  }
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error?: string
}
