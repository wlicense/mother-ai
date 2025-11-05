import { PaletteOptions } from '@mui/material/styles'

// テーマ3: フレッシュグリーン - 成長と活力を象徴する配色
export const palette: PaletteOptions = {
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
    disabled: 'rgba(27, 94, 32, 0.38)',
  },
  divider: 'rgba(46, 125, 50, 0.12)',
}
