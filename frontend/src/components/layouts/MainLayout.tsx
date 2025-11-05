import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, Drawer, Toolbar } from '@mui/material'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'

const DRAWER_WIDTH = 260

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ヘッダー */}
      <Header onMenuClick={handleDrawerToggle} />

      {/* サイドバー */}
      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {/* モバイル用Drawer（一時的） */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <Sidebar />
        </Drawer>

        {/* デスクトップ用Drawer（永続的） */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* メインコンテンツ */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* スペーサー */}
        <Outlet />
      </Box>
    </Box>
  )
}
