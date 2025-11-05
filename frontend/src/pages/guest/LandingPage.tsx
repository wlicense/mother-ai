import { useNavigate } from 'react-router-dom'
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import SpeedIcon from '@mui/icons-material/Speed'

export default function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'AI駆動開発',
      description: '対話するだけで、AIが要件定義からコード生成、デプロイまで自動実行',
    },
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      title: '初心者でもOK',
      description: '開発経験ゼロでも、大規模プロジェクトを完遂できる',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48, color: 'success.main' }} />,
      title: '超高速開発',
      description: '従来の開発時間を1/10に短縮。数週間かかる開発が数日で完成',
    },
  ]

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          マザーAI
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          非エンジニアでも大規模案件を完遂できる
          <br />
          AI駆動開発プラットフォーム
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/apply')}
            startIcon={<RocketLaunchIcon />}
          >
            利用申請する
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/login')}>
            ログイン
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
              <CardContent>
                <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h5" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 8, p: 4, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          どんなプロジェクトも、AIと対話するだけ
        </Typography>
        <Typography variant="body1" paragraph>
          Phase 1: 要件定義 → Phase 2: コード生成 → Phase 3: デプロイ
          <br />
          すべてのフェーズでAIエージェントがサポート。あなたはアイデアを伝えるだけ。
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate('/apply')}
        >
          今すぐ始める
        </Button>
      </Box>
    </Container>
  )
}
