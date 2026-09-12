import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#14110C',
    background: '#E8DFD2',
    backgroundElement: '#FFFBF5',
    backgroundSelected: '#D8CDBE',
    textSecondary: '#6A6156',
    placeholder: 'rgba(106, 97, 86, 0.32)',
    chrome: '#161410',
  },
  dark: {
    text: '#F7F1E6',
    background: '#0C0B09',
    backgroundElement: '#1A1814',
    backgroundSelected: '#2C2820',
    textSecondary: '#B8B0A2',
    placeholder: 'rgba(184, 176, 162, 0.28)',
    chrome: '#161410',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Chrome = {
  surface: '#161410',
  text: '#F4EFE6',
  muted: 'rgba(244, 239, 230, 0.52)',
  faint: 'rgba(244, 239, 230, 0.42)',
  line: 'rgba(244, 239, 230, 0.12)',
} as const;

/** Accent colors for feature areas (fuel = amber, maintenance = blue) */
export const AccentColors = {
  fuel: {
    gradient: ['#F59E0B', '#EA580C'] as const,
    hero: ['#3D2410', '#1A1208', '#0C0A08'] as const,
    surface: 'rgba(245, 158, 11, 0.12)',
    surfaceDark: 'rgba(245, 158, 11, 0.20)',
    border: 'rgba(245, 158, 11, 0.28)',
    borderDark: 'rgba(245, 158, 11, 0.40)',
    text: '#B45309',
    textDark: '#FCD34D',
    icon: '#D97706',
    iconDark: '#FBBF24',
    solid: '#F59E0B',
  },
  maintenance: {
    gradient: ['#3B82F6', '#4F46E5'] as const,
    hero: ['#102A4A', '#0B1528', '#0C0A08'] as const,
    surface: 'rgba(59, 130, 246, 0.12)',
    surfaceDark: 'rgba(59, 130, 246, 0.20)',
    border: 'rgba(59, 130, 246, 0.28)',
    borderDark: 'rgba(59, 130, 246, 0.40)',
    text: '#1D4ED8',
    textDark: '#93C5FD',
    icon: '#2563EB',
    iconDark: '#60A5FA',
    solid: '#3B82F6',
  },
} as const;

export const Fonts = {
  ui: 'DMSans_500Medium',
  uiBold: 'DMSans_700Bold',
  display: 'BebasNeue_400Regular',
  sans: Platform.select({ web: 'var(--font-display)', default: 'DMSans_500Medium' }),
  serif: Platform.select({ web: 'var(--font-serif)', default: 'serif' }),
  rounded: Platform.select({ web: 'var(--font-rounded)', default: 'DMSans_500Medium' }),
  mono: Platform.select({
    web: 'var(--font-mono)',
    ios: 'ui-monospace',
    default: 'monospace',
  }),
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#1A1814',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 18,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0 8px 18px rgba(26, 24, 20, 0.10)',
    },
    default: {
      boxShadow: '0 8px 18px rgba(26, 24, 20, 0.10)',
    },
  }),
  raised: Platform.select({
    ios: {
      shadowColor: '#1A1814',
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.2,
      shadowRadius: 28,
    },
    android: {
      elevation: 10,
    },
    web: {
      boxShadow: '0 14px 28px rgba(26, 24, 20, 0.20)',
    },
    default: {
      boxShadow: '0 14px 28px rgba(26, 24, 20, 0.20)',
    },
  }),
} as const;
