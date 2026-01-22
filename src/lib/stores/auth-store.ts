import { config } from '@/config/config'
import { USER_ROLES } from '@/lib/constants'
import type { UserRole } from '@/lib/permissions'
import Cookies from 'js-cookie'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  initials?: string | null
  avatarColor?: string | null
  phone?: string | null
  document?: string | null
  documentType?: 'CPF' | 'CNPJ' | null
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  login: (user: User, token: string, refreshToken: string) => void
  logout: () => void
  setUser: (user: User) => void
  setTokens: (token: string, refreshToken: string) => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, token, refreshToken) => {
        Cookies.set(config.cookies.tokenName, token, {
          expires: config.cookies.maxAge,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })

        Cookies.set(config.cookies.refreshTokenName, refreshToken, {
          expires: config.cookies.refreshTokenMaxAge,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })

        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        })
      },

      logout: () => {
        Cookies.remove(config.cookies.tokenName)
        Cookies.remove(config.cookies.refreshTokenName)

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      setUser: (user) => {
        set({ user })
      },

      setTokens: (token, refreshToken) => {
        Cookies.set(config.cookies.tokenName, token, {
          expires: config.cookies.maxAge,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })

        Cookies.set(config.cookies.refreshTokenName, refreshToken, {
          expires: config.cookies.refreshTokenMaxAge,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })

        set({ token, refreshToken })
      },

      initAuth: () => {
        const token = Cookies.get(config.cookies.tokenName)
        const refreshToken = Cookies.get(config.cookies.refreshTokenName)
        if (token && refreshToken) {
          set((state) => {
            if (state.user) {
              return { token, refreshToken, isAuthenticated: true }
            }
            return state
          })
        } else {
          set((state) => {
            if (state.isAuthenticated) {
              return { token: null, refreshToken: null, isAuthenticated: false }
            }
            return state
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.user !== null,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = Cookies.get(config.cookies.tokenName)
          const refreshToken = Cookies.get(config.cookies.refreshTokenName)
          if (token && refreshToken && state.user) {
            state.token = token
            state.refreshToken = refreshToken
            state.isAuthenticated = true
          } else if (!token || !refreshToken) {
            state.token = null
            state.refreshToken = null
            state.isAuthenticated = false
            state.user = null
          }
        }
      },
    }
  )
)
