import { create } from 'zustand'

type User = { id: number; email: string; name: string }

type AuthStore = {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

// Mock credentials
const MOCK_USER: User = { id: 1, email: 'demo@coindata.io', name: '데모 사용자' }
const MOCK_TOKEN = 'mock_access_token_demo'

export const useAuthStore = create<AuthStore>((set) => {
  const stored = localStorage.getItem('coindata:token')
  const storedUser = localStorage.getItem('coindata:user')

  return {
    token: stored ?? null,
    user: storedUser ? (JSON.parse(storedUser) as User) : null,
    isAuthenticated: !!stored,

    login: async (email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 600))
      if (!email.includes('@')) return false
      localStorage.setItem('coindata:token', MOCK_TOKEN)
      localStorage.setItem('coindata:user', JSON.stringify(MOCK_USER))
      set({ token: MOCK_TOKEN, user: MOCK_USER, isAuthenticated: true })
      return true
    },

    logout: () => {
      localStorage.removeItem('coindata:token')
      localStorage.removeItem('coindata:user')
      set({ token: null, user: null, isAuthenticated: false })
    },
  }
})
