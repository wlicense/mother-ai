import { Outlet } from 'react-router-dom'
import { Box, Container, Paper, AppBar, Toolbar, Typography } from '@mui/material'

// PublicLayout - 公開ページ（Login, Apply等）用のレイアウト
export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #2e7d32 0%, #00acc1 100%)',
      }}
    >
      {/* ヘッダー */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'transparent',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            🌱 マザーAI
          </Typography>
        </Toolbar>
      </AppBar>

      {/* メインコンテンツ（中央揃え） */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(46, 125, 50, 0.2)',
            }}
          >
            <Outlet />
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}
