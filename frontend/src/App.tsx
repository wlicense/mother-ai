import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AuthLayout from './components/layouts/AuthLayout'

// Pages - Guest
import LandingPage from './pages/guest/LandingPage'
import LoginPage from './pages/guest/LoginPage'
import ApplyPage from './pages/guest/ApplyPage'

// Pages - User
import ProjectsPage from './pages/user/ProjectsPage'
import ProjectDetailPage from './pages/user/ProjectDetailPage'
import ProfilePage from './pages/user/ProfilePage'
import PendingPage from './pages/user/PendingPage'

// Pages - Admin
import ApplicationsPage from './pages/admin/ApplicationsPage'
import UsersManagementPage from './pages/admin/UsersManagementPage'
import ApiMonitorPage from './pages/admin/ApiMonitorPage'

// Auth
import ProtectedRoute from './components/ProtectedRoute'
import { useCurrentUser, useIsAuthenticated } from './hooks/useAuth'

function App() {
  const { data: user } = useCurrentUser()
  const isAuthenticated = useIsAuthenticated()

  // ゲストルート保護（認証済みユーザーをリダイレクト）
  const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated && user?.status === 'pending') {
      return <Navigate to="/pending" replace />
    }

    if (isAuthenticated && user?.status === 'approved') {
      return <Navigate to="/projects" replace />
    }

    return <>{children}</>
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <Routes>
        {/* Guest Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/"
            element={
              <GuestRoute>
                <LandingPage />
              </GuestRoute>
            }
          />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/apply"
            element={
              <GuestRoute>
                <ApplyPage />
              </GuestRoute>
            }
          />
        </Route>

        {/* User Routes */}
        <Route element={<MainLayout />}>
          <Route
            path="/pending"
            element={
              <ProtectedRoute>
                <PendingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Routes */}
        <Route element={<MainLayout />}>
          <Route
            path="/admin/applications"
            element={
              <ProtectedRoute requireAdmin>
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UsersManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/api-monitor"
            element={
              <ProtectedRoute requireAdmin>
                <ApiMonitorPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  )
}

export default App
