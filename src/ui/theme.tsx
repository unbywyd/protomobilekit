import React, { createContext, useContext, useState, useCallback } from 'react'

export type Platform = 'ios' | 'android'

export interface ThemeColors {
  primary: string
  primaryText: string
  background: string
  surface: string
  surfaceSecondary: string
  text: string
  textSecondary: string
  border: string
  danger: string
  success: string
  overlay: string
}

export interface ThemeConfig {
  platform: Platform
  colors: ThemeColors
  // Platform-specific styles
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  // Font weights
  fontWeight: {
    normal: string
    medium: string
    semibold: string
    bold: string
  }
}

// Monochrome palette - strict classic black/white for prototypes
const iosColors: ThemeColors = {
  primary: '#000000',
  primaryText: '#FFFFFF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAFAFA',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E5E5E5',
  danger: '#FF3B30',
  success: '#34C759',
  overlay: 'rgba(0, 0, 0, 0.5)',
}

const androidColors: ThemeColors = {
  primary: '#000000',
  primaryText: '#FFFFFF',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#FAFAFA',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E5E5E5',
  danger: '#F44336',
  success: '#4CAF50',
  overlay: 'rgba(0, 0, 0, 0.5)',
}

const iosTheme: ThemeConfig = {
  platform: 'ios',
  colors: iosColors,
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}

const androidTheme: ThemeConfig = {
  platform: 'android',
  colors: androidColors,
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '500',
    bold: '700',
  },
}

interface ThemeContextValue {
  theme: ThemeConfig
  platform: Platform
  setPlatform: (platform: Platform) => void
  colors: ThemeColors
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultPlatform?: Platform
}

export function ThemeProvider({ children, defaultPlatform = 'ios' }: ThemeProviderProps) {
  const [platform, setPlatformState] = useState<Platform>(defaultPlatform)

  const theme = platform === 'ios' ? iosTheme : androidTheme

  const setPlatform = useCallback((p: Platform) => {
    setPlatformState(p)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, platform, setPlatform, colors: theme.colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    // Return default iOS theme if no provider
    return {
      theme: iosTheme,
      platform: 'ios',
      setPlatform: () => {},
      colors: iosColors,
    }
  }
  return context
}

export function usePlatform(): Platform {
  return useTheme().platform
}

// Helper to get platform-specific value
export function platformSelect<T>(ios: T, android: T): T {
  const { platform } = useTheme()
  return platform === 'ios' ? ios : android
}
