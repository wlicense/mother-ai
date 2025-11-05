import { createTheme, Theme } from '@mui/material/styles'
import { palette } from './palette'
import { typography } from './typography'
import { components } from './components'

// テーマ3: フレッシュグリーン
// 成長と活力を象徴する爽やかなグリーンをベースとしたテーマ
const theme: Theme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  shadows: [
    'none',
    '0px 2px 4px rgba(46, 125, 50, 0.1)',
    '0px 4px 8px rgba(46, 125, 50, 0.12)',
    '0px 6px 12px rgba(46, 125, 50, 0.14)',
    '0px 8px 16px rgba(46, 125, 50, 0.16)',
    '0px 10px 20px rgba(46, 125, 50, 0.18)',
    '0px 12px 24px rgba(46, 125, 50, 0.2)',
    '0px 14px 28px rgba(46, 125, 50, 0.22)',
    '0px 16px 32px rgba(46, 125, 50, 0.24)',
    '0px 18px 36px rgba(46, 125, 50, 0.26)',
    '0px 20px 40px rgba(46, 125, 50, 0.28)',
    '0px 22px 44px rgba(46, 125, 50, 0.3)',
    '0px 24px 48px rgba(46, 125, 50, 0.32)',
    '0px 26px 52px rgba(46, 125, 50, 0.34)',
    '0px 28px 56px rgba(46, 125, 50, 0.36)',
    '0px 30px 60px rgba(46, 125, 50, 0.38)',
    '0px 32px 64px rgba(46, 125, 50, 0.4)',
    '0px 34px 68px rgba(46, 125, 50, 0.42)',
    '0px 36px 72px rgba(46, 125, 50, 0.44)',
    '0px 38px 76px rgba(46, 125, 50, 0.46)',
    '0px 40px 80px rgba(46, 125, 50, 0.48)',
    '0px 42px 84px rgba(46, 125, 50, 0.5)',
    '0px 44px 88px rgba(46, 125, 50, 0.52)',
    '0px 46px 92px rgba(46, 125, 50, 0.54)',
    '0px 48px 96px rgba(46, 125, 50, 0.56)',
  ],
  components,
})

export default theme
