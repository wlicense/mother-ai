import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Paper,
  TextField,
  IconButton,
  Divider,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import SendIcon from '@mui/icons-material/Send'
import CodeIcon from '@mui/icons-material/Code'
import DescriptionIcon from '@mui/icons-material/Description'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'

// Placeholder phases
const phases = [
  {
    id: 1,
    name: 'Phase 1',
    title: '要件定義',
    description: 'プロジェクトの要件を対話で明確化',
    icon: <DescriptionIcon />,
    status: 'completed',
    color: '#1976d2',
  },
  {
    id: 2,
    name: 'Phase 2',
    title: 'コード生成',
    description: 'AIがコードを自動生成',
    icon: <CodeIcon />,
    status: 'in_progress',
    color: '#9c27b0',
  },
  {
    id: 3,
    name: 'Phase 3',
    title: 'デプロイ',
    description: '本番環境へ自動デプロイ',
    icon: <RocketLaunchIcon />,
    status: 'pending',
    color: '#2e7d32',
  },
  {
    id: 4,
    name: 'Phase 4',
    title: '自己改善',
    description: 'フィードバックを元に改善',
    icon: <AutoFixHighIcon />,
    status: 'pending',
    color: '#ed6c02',
  },
]

// Placeholder messages
const mockMessages = [
  { id: 1, role: 'assistant', content: 'こんにちは！プロジェクトの要件を教えてください。' },
  { id: 2, role: 'user', content: 'ECサイトを作りたいです' },
  { id: 3, role: 'assistant', content: 'ECサイトですね。どのような商品を扱う予定ですか？' },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [selectedPhase, setSelectedPhase] = useState(2)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(mockMessages)

  const handleSendMessage = () => {
    if (!message.trim()) return

    setMessages([...messages, { id: messages.length + 1, role: 'user', content: message }])
    setMessage('')

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          role: 'assistant',
          content: 'メッセージを受け取りました。処理中です...',
        },
      ])
    }, 1000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: 'success.main' }} />
      case 'in_progress':
        return <RadioButtonUncheckedIcon sx={{ color: 'primary.main' }} />
      default:
        return <RadioButtonUncheckedIcon sx={{ color: 'grey.400' }} />
    }
  }

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return <Chip label="完了" color="success" size="small" />
      case 'in_progress':
        return <Chip label="進行中" color="primary" size="small" />
      default:
        return <Chip label="未着手" size="small" />
    }
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        プロジェクト #{id}
      </Typography>

      {/* Phase Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          開発フェーズ
        </Typography>
        <Grid container spacing={2}>
          {phases.map((phase) => (
            <Grid item xs={12} sm={6} md={3} key={phase.id}>
              <Card
                sx={{
                  border: selectedPhase === phase.id ? 2 : 0,
                  borderColor: 'primary.main',
                  bgcolor: selectedPhase === phase.id ? 'action.selected' : 'background.paper',
                }}
              >
                <CardActionArea onClick={() => setSelectedPhase(phase.id)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ color: phase.color }}>{phase.icon}</Box>
                      {getStatusIcon(phase.status)}
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      {phase.name}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {phase.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {phase.description}
                    </Typography>
                    {getStatusChip(phase.status)}
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Chat Interface */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {phases.find((p) => p.id === selectedPhase)?.title} - AI対話
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {/* Messages */}
        <Box
          sx={{
            height: 400,
            overflowY: 'auto',
            mb: 2,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
          }}
        >
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                }}
              >
                <Typography variant="body2">{msg.content}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Input */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="メッセージを入力..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton color="primary" onClick={handleSendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  )
}
