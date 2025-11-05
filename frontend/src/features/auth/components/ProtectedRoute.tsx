import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Box, CircularProgress } from '@mui/material'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'user' | 'admin'
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  // ローディング中
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  // 未認証の場合、ログインページへリダイレクト
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  // ユーザーステータスチェック
  if (user?.status === 'pending') {
    return <Navigate to="/pending" replace />
  }

  if (user?.status === 'rejected') {
    return <Navigate to="/login" replace />
  }

  if (user?.status === 'suspended') {
    return <Navigate to="/login" replace />
  }

  // 権限チェック
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/projects" replace />
  }

  return <>{children}</>
}
