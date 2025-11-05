import { Components, Theme } from '@mui/material/styles'

export const components: Components<Omit<Theme, 'components'>> = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
        borderRadius: 8,
        padding: '10px 24px',
        fontSize: '0.95rem',
        transition: 'all 0.3s ease',
      },
      contained: {
        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
        '&:hover': {
          boxShadow: '0 6px 16px rgba(46, 125, 50, 0.35)',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      outlined: {
        borderWidth: '2px',
        '&:hover': {
          borderWidth: '2px',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(46, 125, 50, 0.08)',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(46, 125, 50, 0.15)',
          transform: 'translateY(-4px)',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)',
        backdropFilter: 'blur(8px)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#ffffff',
        borderRight: '1px solid rgba(46, 125, 50, 0.12)',
        boxShadow: '2px 0 8px rgba(46, 125, 50, 0.05)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          transition: 'all 0.3s ease',
          '&:hover fieldset': {
            borderColor: '#2e7d32',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#2e7d32',
            borderWidth: '2px',
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
      filled: {
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        color: '#1b5e20',
        '&:hover': {
          backgroundColor: 'rgba(46, 125, 50, 0.2)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.08)',
      },
      elevation2: {
        boxShadow: '0 4px 12px rgba(46, 125, 50, 0.12)',
      },
      elevation3: {
        boxShadow: '0 6px 16px rgba(46, 125, 50, 0.16)',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        margin: '4px 8px',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(46, 125, 50, 0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(46, 125, 50, 0.12)',
          '&:hover': {
            backgroundColor: 'rgba(46, 125, 50, 0.16)',
          },
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: '#1b5e20',
        fontSize: '0.875rem',
        borderRadius: 6,
      },
      arrow: {
        color: '#1b5e20',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
      standardSuccess: {
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        color: '#1b5e20',
      },
      standardInfo: {
        backgroundColor: 'rgba(0, 172, 193, 0.1)',
        color: '#007c91',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        height: 8,
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        '& .MuiSwitch-switchBase.Mui-checked': {
          color: '#2e7d32',
          '& + .MuiSwitch-track': {
            backgroundColor: '#2e7d32',
            opacity: 0.5,
          },
        },
      },
    },
  },
}
