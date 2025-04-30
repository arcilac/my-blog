'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { ThemeProviderState, ThemeProviderProps, Theme } from '@/lib/types'

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(storageKey) as Theme
      return storedTheme || defaultTheme
    }
    return defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
