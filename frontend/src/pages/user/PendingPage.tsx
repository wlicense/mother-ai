import { Box, Card, CardContent, Typography, Alert, Button } from '@mui/material'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

export default function PendingPage() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <HourglassEmptyIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            審査中
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ご申請ありがとうございます。
            <br />
            現在、管理者が審査を行っています。
          </Typography>
          <Alert severity="info" sx={{ mt: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>審査にかかる時間:</strong> 通常1-2営業日
              <br />
              <strong>お問い合わせ:</strong> support@mother-ai.example.com
            </Typography>
          </Alert>
          <Button variant="outlined" onClick={handleLogout} sx={{ mt: 3 }}>
            ログアウト
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}
