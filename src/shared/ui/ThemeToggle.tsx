import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}
