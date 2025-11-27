import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../lib/api'

interface User {
  id: string
  username: string
  email: string
  role: string
  sites: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password)

      setToken(response.token)
      setUser(response.user)

      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')

    // Call logout endpoint (fire and forget)
    authApi.logout().catch(() => {})
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
