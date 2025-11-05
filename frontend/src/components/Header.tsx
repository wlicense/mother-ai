import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box,
  Chip,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import { useAuth } from '@/features/auth/hooks/useAuth'

interface HeaderProps {
  onMenuClick?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setAnchorEl(null)
    }
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #2e7d32 0%, #00acc1 100%)',
      }}
    >
      <Toolbar>
        {onMenuClick && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 2,
              display: { sm: 'block', md: 'none' },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          🌱 マザーAI
          {user?.role === 'admin' && (
            <Chip
              label="管理者"
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
              }}
            />
          )}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {user?.name}
            </Typography>
          </Box>

          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              p: 0.5,
            }}
          >
            {user?.avatar ? (
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{
                  width: 36,
                  height: 36,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <AccountCircle />
              </Avatar>
            )}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            sx={{
              mt: 1,
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setAnchorEl(null)
                navigate('/profile')
              }}
            >
              プロフィール
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null)
                navigate('/projects')
              }}
            >
              プロジェクト一覧
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              ログアウト
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
