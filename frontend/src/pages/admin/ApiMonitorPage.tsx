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
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ApiIcon from '@mui/icons-material/Api'

// Mock data
const mockStats = {
  totalCalls: 12450,
  totalCost: 25800,
  todayCalls: 1230,
  todayCost: 2400,
}

const mockRecentCalls = [
  {
    id: '1',
    userId: '山田太郎',
    projectName: 'ECサイト構築',
    model: 'claude-3-5-sonnet-20250929',
    tokens: 1250,
    cost: 180,
    timestamp: '2025-11-05 15:30:22',
  },
  {
    id: '2',
    userId: '佐藤花子',
    projectName: '在庫管理システム',
    model: 'claude-3-5-sonnet-20250929',
    tokens: 980,
    cost: 140,
    timestamp: '2025-11-05 15:28:15',
  },
]

export default function ApiMonitorPage() {
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
                {mockStats.totalCalls.toLocaleString()}
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
                ¥{mockStats.totalCost.toLocaleString()}
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
                {mockStats.todayCalls.toLocaleString()}
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
                ¥{mockStats.todayCost.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Calls Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            最近のAPI呼び出し
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>日時</TableCell>
                  <TableCell>ユーザー</TableCell>
                  <TableCell>プロジェクト</TableCell>
                  <TableCell>モデル</TableCell>
                  <TableCell>トークン数</TableCell>
                  <TableCell>コスト（円）</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockRecentCalls.map((call) => (
                  <TableRow key={call.id}>
                    <TableCell>{call.timestamp}</TableCell>
                    <TableCell>{call.userId}</TableCell>
                    <TableCell>{call.projectName}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {call.model}
                      </Typography>
                    </TableCell>
                    <TableCell>{call.tokens.toLocaleString()}</TableCell>
                    <TableCell>¥{call.cost}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
