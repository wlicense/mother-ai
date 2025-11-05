import { createTheme } from '@mui/material/styles'

// テーマ3: フレッシュグリーン - 成長と活力を象徴する爽やかなグリーン
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00acc1',
      light: '#00e5ff',
      dark: '#007c91',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#f57c00',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#00acc1',
      light: '#26c6da',
      dark: '#00838f',
    },
    background: {
      default: '#f1f8f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#1b5e20',
      secondary: '#388e3c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans JP", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1b5e20',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1b5e20',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#2e7d32',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#2e7d32',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#388e3c',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#388e3c',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(46, 125, 50, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(46, 125, 50, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(46, 125, 50, 0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(46, 125, 50, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover fieldset': {
              borderColor: '#2e7d32',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2e7d32',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
})

export default theme
