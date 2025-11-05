import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
} from '@mui/material'

export default function ApplyPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    purpose: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    if (formData.purpose.length < 20) {
      setError('利用目的は20文字以上入力してください')
      return
    }

    // TODO: Implement actual application API call
    console.log('Application submitted:', formData)

    // Placeholder success
    setSuccess(true)
    setTimeout(() => {
      navigate('/login')
    }, 3000)
  }

  if (success) {
    return (
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
        <Alert severity="success">
          <Typography variant="h6" gutterBottom>
            申請を受け付けました
          </Typography>
          <Typography variant="body2">
            審査が完了次第、メールでお知らせします。通常1-2営業日かかります。
            <br />
            3秒後にログインページへ移動します...
          </Typography>
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom textAlign="center" fontWeight="bold">
            利用申請
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
            マザーAIの利用には審査が必要です
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="お名前"
              value={formData.name}
              onChange={handleChange('name')}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="メールアドレス"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="パスワード"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required
              helperText="8文字以上の英数字"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="パスワード（確認）"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="利用目的"
              multiline
              rows={4}
              value={formData.purpose}
              onChange={handleChange('purpose')}
              required
              helperText="どのようなプロジェクトで利用したいか、具体的に記述してください（20文字以上）"
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" fullWidth size="large">
              申請する
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              すでにアカウントをお持ちですか？{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/login')}
                sx={{ cursor: 'pointer' }}
              >
                ログイン
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
