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
        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

      {/* Additional Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  総トークン数
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats.total_tokens.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  平均コスト/リクエスト
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                ¥{stats.total_requests > 0 ? Math.round(stats.total_cost / stats.total_requests).toLocaleString() : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  アクティブPhase数
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats.phase_stats ? stats.phase_stats.length : 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Cache Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  キャッシュヒット率（全期間）
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.cache_stats.total_cache_hit_rate.toFixed(2)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.cache_stats.total_cached_requests.toLocaleString()} / {stats.total_requests.toLocaleString()} リクエスト
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  キャッシュヒット率（今日）
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.cache_stats.today_cache_hit_rate.toFixed(2)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats.cache_stats.today_cached_requests.toLocaleString()} / {stats.today_requests.toLocaleString()} リクエスト
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  総キャッシュリクエスト数
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats.cache_stats.total_cached_requests.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  今日のキャッシュリクエスト数
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {stats.cache_stats.today_cached_requests.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Phase Stats Tables */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phase別統計（全期間）
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Phase</TableCell>
                      <TableCell align="right">呼び出し数</TableCell>
                      <TableCell align="right">コスト（円）</TableCell>
                      <TableCell align="right">トークン数</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.phase_stats && stats.phase_stats.length > 0 ? (
                      stats.phase_stats.map((phase) => (
                        <TableRow key={phase.phase}>
                          <TableCell>Phase {phase.phase}</TableCell>
                          <TableCell align="right">{phase.total_requests.toLocaleString()}</TableCell>
                          <TableCell align="right">¥{Math.round(phase.total_cost).toLocaleString()}</TableCell>
                          <TableCell align="right">{phase.total_tokens.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">データがありません</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phase別統計（今日）
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Phase</TableCell>
                      <TableCell align="right">呼び出し数</TableCell>
                      <TableCell align="right">コスト（円）</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.today_phase_stats && stats.today_phase_stats.length > 0 ? (
                      stats.today_phase_stats.map((phase) => (
                        <TableRow key={phase.phase}>
                          <TableCell>Phase {phase.phase}</TableCell>
                          <TableCell align="right">{phase.requests.toLocaleString()}</TableCell>
                          <TableCell align="right">¥{Math.round(phase.cost).toLocaleString()}</TableCell>
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
