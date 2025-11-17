import { useAuthStore } from '@/lib/stores'
import { authApi, LoginRequest } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, login: setAuth, logout: clearAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authApi.login(credentials)
      setAuth(response.user, response.access_token)

      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await authApi.logout()
    } catch (err) {
      console.error('Erro ao fazer logout:', err)
    } finally {
      clearAuth()
      setIsLoading(false)
      router.push('/login')
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  }
}
