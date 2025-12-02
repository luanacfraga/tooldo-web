import { AuthService, type RegisterRequest } from '@/lib/api/services/auth.service'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function useAuth() {
  const router = useRouter()
  const { user, isAuthenticated, login: setAuth, logout: clearAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await AuthService.signIn(email, password)

      // Debug: log the API response
      if (typeof window !== 'undefined') {
        console.log('API Response:', response)
        console.log('User role from API:', response.user.role)
      }

      // Map API response to store format
      const userForStore = {
        id: response.user.id,
        email: response.user.email,
        name: `${response.user.firstName} ${response.user.lastName}`,
        role: response.user.role,
      }

      // Debug: log the user for store
      if (typeof window !== 'undefined') {
        console.log('User for store:', userForStore)
      }

      setAuth(userForStore, response.access_token)

      // Wait a bit to ensure state is persisted before redirecting
      // This is important for Zustand persist to save to localStorage
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Redirect based on user role
      // Admins go to company selection, others go to dashboard
      const redirectPath = userForStore.role === 'admin' ? '/select-company' : '/dashboard'

      // Debug: log the redirect path
      if (typeof window !== 'undefined') {
        console.log(
          'Login successful. User role:',
          userForStore.role,
          'Type:',
          typeof userForStore.role,
          'Redirecting to:',
          redirectPath
        )
      }

      // Use router.replace instead of window.location to maintain state
      router.replace(redirectPath)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      await AuthService.register(data)

      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      } else {
        router.push('/login')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao fazer cadastro'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      await AuthService.logout()
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
    register,
    logout,
  }
}
