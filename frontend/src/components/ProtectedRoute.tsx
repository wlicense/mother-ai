import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { isAuthenticated, isApproved, isAdmin } from '../services/authService'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
  requireApproved?: boolean
}

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireApproved = true,
}: ProtectedRouteProps) {
  // ログイン確認
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  // 承認確認
  if (requireApproved && !isApproved()) {
    return <Navigate to="/pending" replace />
  }

  // 管理者確認
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/projects" replace />
  }

  return <>{children}</>
}
