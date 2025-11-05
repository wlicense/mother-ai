import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// Mock data
const mockUsers = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@example.com',
    role: 'user',
    status: 'approved',
    projectCount: 3,
    lastLogin: '2025-11-05 14:20',
  },
  {
    id: '2',
    name: '佐藤花子',
    email: 'sato@example.com',
    role: 'user',
    status: 'approved',
    projectCount: 1,
    lastLogin: '2025-11-04 09:15',
  },
]

export default function UsersManagementPage() {
  const handleToggleStatus = (id: string) => {
    // TODO: Implement status toggle API
    console.log('Toggle status:', id)
  }

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip label="承認済み" color="success" size="small" />
      case 'pending':
        return <Chip label="審査中" color="warning" size="small" />
      case 'rejected':
        return <Chip label="却下" color="error" size="small" />
      case 'suspended':
        return <Chip label="停止中" color="default" size="small" />
      default:
        return <Chip label="不明" size="small" />
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        ユーザー管理
      </Typography>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>氏名</TableCell>
                  <TableCell>メール</TableCell>
                  <TableCell>ロール</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell>プロジェクト数</TableCell>
                  <TableCell>最終ログイン</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role === 'admin' ? '管理者' : 'ユーザー'}
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getStatusChip(user.status)}</TableCell>
                    <TableCell>{user.projectCount}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color={user.status === 'approved' ? 'error' : 'success'}
                        onClick={() => handleToggleStatus(user.id)}
                      >
                        {user.status === 'approved' ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                    </TableCell>
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
