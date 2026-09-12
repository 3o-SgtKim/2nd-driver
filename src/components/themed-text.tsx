import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'heading'
    | 'display'
    | 'eyebrow'
    | 'link'
    | 'linkPrimary'
    | 'code';
  themeColor?: ThemeColor;
};

const DISPLAY_TYPES = new Set(['title', 'subtitle', 'heading', 'display', 'eyebrow']);
const BOLD_TYPES = new Set(['smallBold', 'linkPrimary']);

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const fontFamily = DISPLAY_TYPES.has(type)
    ? Fonts.display
    : BOLD_TYPES.has(type)
      ? Fonts.uiBold
      : type === 'code'
        ? Fonts.mono
        : Fonts.ui;

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'], fontFamily },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'heading' && styles.heading,
        type === 'display' && styles.display,
        type === 'eyebrow' && styles.eyebrow,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 400,
    lineHeight: 52,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: 400,
    letterSpacing: 0.6,
  },
  heading: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: 400,
    letterSpacing: 0.8,
  },
  display: {
    fontSize: 56,
    lineHeight: 58,
    fontWeight: 400,
    letterSpacing: 1.2,
  },
  eyebrow: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: 400,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
