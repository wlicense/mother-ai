import { useContext } from 'react'
import { AuthContext, AuthContextType } from '../contexts/AuthContext'

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

// 権限チェック用のカスタムフック
export const useRequireAuth = (requiredRole?: 'user' | 'admin'): boolean => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return false
  }

  if (requiredRole && user.role !== requiredRole) {
    return false
  }

  return true
}

// ユーザーステータスチェック用のカスタムフック
export const useUserStatus = (): {
  isApproved: boolean
  isPending: boolean
  isRejected: boolean
  isSuspended: boolean
} => {
  const { user } = useAuth()

  return {
    isApproved: user?.status === 'approved',
    isPending: user?.status === 'pending',
    isRejected: user?.status === 'rejected',
    isSuspended: user?.status === 'suspended',
  }
}
