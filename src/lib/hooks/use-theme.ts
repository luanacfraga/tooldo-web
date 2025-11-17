import { useThemeStore } from '@/lib/stores/theme-store'
import { useEffect } from 'react'

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore()

  // Apply theme on mount and when it changes
  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  return {
    theme,
    setTheme,
    toggleTheme,
  }
}
