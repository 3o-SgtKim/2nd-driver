import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** Accent colors for feature areas (fuel = amber/yellow, maintenance = blue) */
export const AccentColors = {
  fuel: {
    gradient: ['#F59E0B', '#F97316'] as const,
    surface: 'rgba(245, 158, 11, 0.10)',
    surfaceDark: 'rgba(245, 158, 11, 0.18)',
    border: 'rgba(245, 158, 11, 0.25)',
    borderDark: 'rgba(245, 158, 11, 0.35)',
    text: '#B45309',
    textDark: '#FCD34D',
    icon: '#D97706',
    iconDark: '#FBBF24',
    solid: '#F59E0B',
  },
  maintenance: {
    gradient: ['#3B82F6', '#6366F1'] as const,
    surface: 'rgba(59, 130, 246, 0.10)',
    surfaceDark: 'rgba(59, 130, 246, 0.18)',
    border: 'rgba(59, 130, 246, 0.25)',
    borderDark: 'rgba(59, 130, 246, 0.35)',
    text: '#1D4ED8',
    textDark: '#93C5FD',
    icon: '#2563EB',
    iconDark: '#60A5FA',
    solid: '#3B82F6',
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

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
