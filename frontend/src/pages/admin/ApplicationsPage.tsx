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
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'

// Mock data
const mockApplications = [
  {
    id: '1',
    name: '山田太郎',
    email: 'yamada@example.com',
    purpose: 'ECサイトの開発を学びたい',
    status: 'pending',
    appliedAt: '2025-11-05 10:30',
  },
  {
    id: '2',
    name: '佐藤花子',
    email: 'sato@example.com',
    purpose: '社内システムの構築',
    status: 'pending',
    appliedAt: '2025-11-05 09:15',
  },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(mockApplications)
  const [selectedApp, setSelectedApp] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = (id: string) => {
    // TODO: Implement approve API
    console.log('Approve:', id)
    setApplications(applications.filter((app) => app.id !== id))
    setSelectedApp(null)
  }

  const handleReject = (id: string) => {
    // TODO: Implement reject API
    console.log('Reject:', id, rejectReason)
    setApplications(applications.filter((app) => app.id !== id))
    setSelectedApp(null)
    setRejectReason('')
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        申請審査
      </Typography>

      <Card>
        <CardContent>
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
                {applications.map((app) => (
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
                        sx={{ mr: 1 }}
                      >
                        承認
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => setSelectedApp(app)}
                      >
                        却下
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {applications.length === 0 && (
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
