import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ApiIcon from '@mui/icons-material/Api'
import { useAPIStats } from '../../hooks/useAdmin'

export default function ApiMonitorPage() {
  const { data: stats, isLoading, error } = useAPIStats()

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !stats) {
    return (
      <Alert severity="error">
        API統計の取得に失敗しました
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        API監視ダッシュボード
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ApiIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  総API呼び出し数
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.total_requests.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  総コスト（円）
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                ¥{Math.round(stats.total_cost).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  今日の呼び出し数
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats.today_requests.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  今日のコスト（円）
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                ¥{Math.round(stats.today_cost).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Users Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            トップユーザー
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ユーザー名</TableCell>
                  <TableCell>総API呼び出し数</TableCell>
                  <TableCell>総コスト（円）</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.top_users && stats.top_users.length > 0 ? (
                  stats.top_users.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell>{user.user_name}</TableCell>
                      <TableCell>{user.total_requests.toLocaleString()}</TableCell>
                      <TableCell>¥{Math.round(user.total_cost).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      <Typography color="text.secondary">データがありません</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
