import { create } from 'zustand'
import { env } from '../config/env'

type Theme = 'dark' | 'light'

type ThemeStore = {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('coindata:theme')
  if (stored === 'dark' || stored === 'light') return stored
  return env.defaultTheme
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('coindata:theme', theme)
}

export const useThemeStore = create<ThemeStore>((set) => {
  const initial = getInitialTheme()
  applyTheme(initial)

  return {
    theme: initial,
    toggleTheme: () =>
      set((state) => {
        const next = state.theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        return { theme: next }
      }),
    setTheme: (theme) =>
      set(() => {
        applyTheme(theme)
        return { theme }
      }),
  }
})
