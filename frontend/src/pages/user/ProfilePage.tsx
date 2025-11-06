import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import { useCurrentUser, useUpdateProfile } from '../../hooks/useAuth'

export default function ProfilePage() {
  const { data: user, isLoading } = useCurrentUser()
  const updateProfileMutation = useUpdateProfile()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    claudeApiKey: '',
  })

  // ユーザー情報が読み込まれたらフォームに設定
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        claudeApiKey: '',
      })
    }
  }, [user])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        custom_claude_api_key: formData.claudeApiKey || undefined,
      })
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
        プロフィール設定
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                基本情報
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {updateProfileMutation.isSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  保存しました
                </Alert>
              )}

              {updateProfileMutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  保存に失敗しました
                </Alert>
              )}

              <TextField
                fullWidth
                label="お名前"
                value={formData.name}
                onChange={handleChange('name')}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="メールアドレス"
                value={formData.email}
                onChange={handleChange('email')}
                disabled
                helperText="メールアドレスは変更できません"
                sx={{ mb: 3 }}
              />
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                startIcon={updateProfileMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                {updateProfileMutation.isPending ? '保存中...' : '保存'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                API設定
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <TextField
                fullWidth
                label="Claude API Key（オプション）"
                type="password"
                value={formData.claudeApiKey}
                onChange={handleChange('claudeApiKey')}
                helperText="独自のAPIキーを使用する場合のみ設定"
                sx={{ mb: 2 }}
              />
              <Alert severity="info">
                <Typography variant="body2">
                  APIキーを設定すると、あなた自身のClaude APIを使用します。
                  <br />
                  料金は直接Anthropicから請求されます。
                </Typography>
              </Alert>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                使用量
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>プロジェクト数:</Typography>
                <Typography fontWeight="bold">2</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>APIコール数（今月）:</Typography>
                <Typography fontWeight="bold">1,234</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>推定コスト（今月）:</Typography>
                <Typography fontWeight="bold">¥3,200</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
