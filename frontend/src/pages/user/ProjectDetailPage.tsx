import { useState, useEffect, useRef } from 'react'
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
  CircularProgress,
  Alert,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import SendIcon from '@mui/icons-material/Send'
import CodeIcon from '@mui/icons-material/Code'
import DescriptionIcon from '@mui/icons-material/Description'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { useProject, useSendMessage } from '../../hooks/useProjects'

// Phase定義
const phases = [
  {
    id: 1,
    name: 'Phase 1',
    title: '要件定義',
    description: 'プロジェクトの要件を対話で明確化',
    icon: <DescriptionIcon />,
    color: '#1976d2',
  },
  {
    id: 2,
    name: 'Phase 2',
    title: 'コード生成',
    description: 'AIがコードを自動生成',
    icon: <CodeIcon />,
    color: '#9c27b0',
  },
  {
    id: 3,
    name: 'Phase 3',
    title: 'デプロイ',
    description: '本番環境へ自動デプロイ',
    icon: <RocketLaunchIcon />,
    color: '#2e7d32',
  },
  {
    id: 4,
    name: 'Phase 4',
    title: '自己改善',
    description: 'フィードバックを元に改善',
    icon: <AutoFixHighIcon />,
    color: '#ed6c02',
  },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [selectedPhase, setSelectedPhase] = useState(1)
  const [message, setMessage] = useState('')
  const [streamingMessage, setStreamingMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: project, isLoading, error } = useProject(id!)
  const { sendMessage } = useSendMessage()

  // メッセージリストの最下部にスクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [project?.messages, streamingMessage])

  // プロジェクト読み込み時に現在のPhaseを設定
  useEffect(() => {
    if (project) {
      setSelectedPhase(project.current_phase)
    }
  }, [project])

  const handleSendMessage = async () => {
    if (!message.trim() || !id || isStreaming) return

    const userMessage = message
    setMessage('')
    setIsStreaming(true)
    setStreamingMessage('')

    try {
      await sendMessage(
        id,
        userMessage,
        selectedPhase,
        (token: string) => {
          // トークン受信時
          setStreamingMessage((prev) => prev + token)
        },
        (messageId: string) => {
          // ストリーム完了時
          setIsStreaming(false)
          setStreamingMessage('')
          console.log('メッセージ完了:', messageId)
        },
        (error: string) => {
          // エラー発生時
          setIsStreaming(false)
          setStreamingMessage('')
          console.error('メッセージエラー:', error)
        }
      )
    } catch (error) {
      setIsStreaming(false)
      setStreamingMessage('')
      console.error('メッセージ送信エラー:', error)
    }
  }

  const getPhaseStatus = (phaseId: number): string => {
    if (!project) return 'pending'

    if (phaseId < project.current_phase) return 'completed'
    if (phaseId === project.current_phase) return 'in_progress'
    return 'pending'
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !project) {
    return (
      <Alert severity="error">
        プロジェクトの読み込みに失敗しました
      </Alert>
    )
  }

  // 選択したPhaseのメッセージをフィルタ
  const phaseMessages = project.messages?.filter((msg) => msg.phase === selectedPhase) || []

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        {project.name}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {project.description}
      </Typography>

      {/* Phase Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          開発フェーズ
        </Typography>
        <Grid container spacing={2}>
          {phases.map((phase) => {
            const status = getPhaseStatus(phase.id)
            return (
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
                        {getStatusIcon(status)}
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
                      {getStatusChip(status)}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            )
          })}
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
          {phaseMessages.length === 0 && !streamingMessage && (
            <Typography variant="body2" color="text.secondary" textAlign="center">
              メッセージがありません。最初のメッセージを送信してください。
            </Typography>
          )}

          {phaseMessages.map((msg) => (
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
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              </Paper>
            </Box>
          ))}

          {/* ストリーミング中のメッセージ */}
          {streamingMessage && (
            <Box
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: 'grey.100',
                  color: 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {streamingMessage}
                </Typography>
              </Paper>
            </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="メッセージを入力..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={isStreaming}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!message.trim() || isStreaming}
          >
            {isStreaming ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
    </Box>
  )
}
