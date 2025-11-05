import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { MockAuthService, MockUser, AuthResponse } from '../services/mockAuthService'
import { TokenService } from '../services/tokenService'

export interface AuthContextType {
  user: MockUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterData) => Promise<void>
  refreshAuth: () => Promise<void>
}

export interface RegisterData {
  email: string
  name: string
  password: string
  purpose: string
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 初期化: ローカルストレージから認証情報を復元
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = TokenService.getToken()
        const savedUser = TokenService.getUser()

        if (token && savedUser) {
          // トークンの有効期限チェック
          if (TokenService.isTokenExpired(token)) {
            // リフレッシュトークンで更新
            const refreshToken = TokenService.getRefreshToken()
            if (refreshToken) {
              await refreshAuth()
            } else {
              TokenService.clearAll()
            }
          } else {
            setUser(savedUser)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        TokenService.clearAll()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // ログイン
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response: AuthResponse = await MockAuthService.login(email, password)

      // トークンとユーザー情報を保存
      TokenService.setToken(response.token)
      TokenService.setRefreshToken(response.refreshToken)
      TokenService.setUser(response.user)

      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error: any) {
      throw new Error(error.message || 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ログアウト
  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await MockAuthService.logout()
      TokenService.clearAll()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ユーザー登録
  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true)
    try {
      await MockAuthService.register(data)
    } catch (error: any) {
      throw new Error(error.message || '登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 認証情報のリフレッシュ
  const refreshAuth = useCallback(async () => {
    try {
      const refreshToken = TokenService.getRefreshToken()
      if (!refreshToken) {
        throw new Error('リフレッシュトークンがありません')
      }

      const response: AuthResponse = await MockAuthService.refreshToken(refreshToken)

      TokenService.setToken(response.token)
      TokenService.setRefreshToken(response.refreshToken)
      TokenService.setUser(response.user)

      setUser(response.user)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Token refresh error:', error)
      TokenService.clearAll()
      setUser(null)
      setIsAuthenticated(false)
      throw error
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    refreshAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
