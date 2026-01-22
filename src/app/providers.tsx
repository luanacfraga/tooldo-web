'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'
import { Toaster } from 'sonner'
import { UserProvider } from '@/lib/contexts/user-context'
import { ApiError } from '@/lib/api/api-client'
import { useAuthStore } from '@/lib/stores/auth-store'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const logout = useAuthStore((state) => state.logout)

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Não tenta novamente em caso de erro 401 (já tratado pelo interceptor)
              if (error instanceof ApiError && error.status === 401) {
                return false
              }
              // Tenta até 3 vezes para outros erros
              return failureCount < 3
            },
          },
          mutations: {
            onError: (error) => {
              // Handler global para erros de mutação
              if (error instanceof ApiError && error.status === 401) {
                // Se chegou um 401 aqui, significa que o refresh falhou
                // O interceptor já deve ter redirecionado, mas garantimos
                logout()
                if (typeof window !== 'undefined') {
                  window.location.href = '/login'
                }
              }
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        {children}
        <Toaster position="top-right" richColors />
      </UserProvider>
    </QueryClientProvider>
  )
}
