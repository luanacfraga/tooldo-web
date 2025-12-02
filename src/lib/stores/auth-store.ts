import { config } from '@/config/index'
import Cookies from 'js-cookie'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'master' | 'admin' | 'manager' | 'executor' | 'consultant'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean

  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (user: User) => void
  initAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => {
        // Store token in cookie
        Cookies.set(config.cookies.tokenName, token, {
          expires: config.cookies.maxAge,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
        })

        set({
          user,
          token,
          isAuthenticated: true,
        })
      },

      logout: () => {
        // Remove token from cookie
        Cookies.remove(config.cookies.tokenName)

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },

      setUser: (user) => {
        set({ user })
      },

      initAuth: () => {
        // Try to get token from cookie on init
        const token = Cookies.get(config.cookies.tokenName)
        if (token) {
          // Only set token and isAuthenticated if user exists in state
          // This prevents clearing the user on reload
          set((state) => {
            if (state.user) {
              return { token, isAuthenticated: true }
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
        // Don't persist token in localStorage, only in cookies
      }),
    }
  )
)
