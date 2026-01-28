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
              if (error instanceof ApiError && error.status === 401) {
                return false
              }
              return failureCount < 3
            },
          },
          mutations: {
            onError: (error) => {
              if (error instanceof ApiError && error.status === 401) {
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
