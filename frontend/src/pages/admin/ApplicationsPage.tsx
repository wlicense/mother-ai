import { useState } from 'react'
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import {
  usePendingApplications,
  useApproveApplication,
  useRejectApplication,
} from '../../hooks/useAdmin'

export default function ApplicationsPage() {
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: applications, isLoading, error } = usePendingApplications()
  const approveMutation = useApproveApplication()
  const rejectMutation = useRejectApplication()

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id)
      setSelectedApp(null)
    } catch (error) {
      console.error('承認エラー:', error)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      return
    }

    try {
      await rejectMutation.mutateAsync({ id, reason: rejectReason })
      setSelectedApp(null)
      setRejectReason('')
    } catch (error) {
      console.error('却下エラー:', error)
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
        申請一覧の取得に失敗しました
      </Alert>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        申請審査
      </Typography>

      <Card>
        <CardContent>
          {applications && applications.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>申請日時</TableCell>
                    <TableCell>氏名</TableCell>
                    <TableCell>メール</TableCell>
                    <TableCell>利用目的</TableCell>
                    <TableCell>ステータス</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.appliedAt}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>{app.purpose}</TableCell>
                    <TableCell>
                      <Chip label="審査中" color="warning" size="small" />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => handleApprove(app.id)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                        sx={{ mr: 1 }}
                      >
                        {approveMutation.isPending ? '承認中...' : '承認'}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => setSelectedApp(app)}
                        disabled={approveMutation.isPending || rejectMutation.isPending}
                      >
                        却下
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">審査待ちの申請はありません</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={!!selectedApp} onClose={() => setSelectedApp(null)} maxWidth="sm" fullWidth>
        <DialogTitle>申請を却下</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            却下理由を入力してください（ユーザーにメールで送信されます）
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="例: 利用目的が不明確です。具体的なプロジェクト内容を記載してください。"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedApp(null)}>キャンセル</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => selectedApp && handleReject(selectedApp.id)}
          >
            却下する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
