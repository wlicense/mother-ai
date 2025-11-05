import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Typography,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PersonIcon from '@mui/icons-material/Person'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart'
import PeopleIcon from '@mui/icons-material/People'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface MenuItem {
  text: string
  icon: React.ReactNode
  path: string
  roles: Array<'user' | 'admin'>
}

export const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const userMenuItems: MenuItem[] = [
    {
      text: 'プロジェクト',
      icon: <DashboardIcon />,
      path: '/projects',
      roles: ['user', 'admin'],
    },
    {
      text: 'プロフィール',
      icon: <PersonIcon />,
      path: '/profile',
      roles: ['user', 'admin'],
    },
  ]

  const adminMenuItems: MenuItem[] = [
    {
      text: '申請審査',
      icon: <AdminPanelSettingsIcon />,
      path: '/admin/applications',
      roles: ['admin'],
    },
    {
      text: 'ユーザー管理',
      icon: <PeopleIcon />,
      path: '/admin/users',
      roles: ['admin'],
    },
    {
      text: 'API監視',
      icon: <MonitorHeartIcon />,
      path: '/admin/api-monitor',
      roles: ['admin'],
    },
  ]

  const hasAccess = (roles: Array<'user' | 'admin'>) => {
    return user?.role && roles.includes(user.role)
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />

      {/* ユーザーメニュー */}
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          メニュー
        </Typography>
      </Box>
      <List>
        {userMenuItems
          .filter((item) => hasAccess(item.roles))
          .map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(46, 125, 50, 0.12)',
                    '&:hover': {
                      bgcolor: 'rgba(46, 125, 50, 0.18)',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>

      {/* 管理者メニュー */}
      {user?.role === 'admin' && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              管理者
            </Typography>
          </Box>
          <List>
            {adminMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(46, 125, 50, 0.12)',
                      '&:hover': {
                        bgcolor: 'rgba(46, 125, 50, 0.18)',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* フッター */}
      <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(46, 125, 50, 0.12)' }}>
        <Typography variant="caption" color="text.secondary">
          マザーAI v1.0
        </Typography>
      </Box>
    </Box>
  )
}
