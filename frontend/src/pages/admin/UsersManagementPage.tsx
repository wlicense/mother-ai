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
  CircularProgress,
  Alert,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useAllUsers, useSuspendUser, useActivateUser } from '../../hooks/useAdmin'

export default function UsersManagementPage() {
  const { data: users, isLoading, error } = useAllUsers()
  const suspendMutation = useSuspendUser()
  const activateMutation = useActivateUser()

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      if (currentStatus === 'approved') {
        await suspendMutation.mutateAsync(userId)
      } else if (currentStatus === 'suspended') {
        await activateMutation.mutateAsync(userId)
      }
    } catch (error) {
      console.error('ステータス変更エラー:', error)
    }
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        ユーザー一覧の取得に失敗しました
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        ユーザー管理
      </Typography>

      <Card>
        <CardContent>
          {users && users.length > 0 ? (
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
                  {users.map((user: any) => (
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
                    <TableCell>{user.last_login || '-'}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color={user.status === 'approved' ? 'error' : 'success'}
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        disabled={suspendMutation.isPending || activateMutation.isPending}
                      >
                        {user.status === 'approved' ? <BlockIcon /> : <CheckCircleIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">ユーザーがいません</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
