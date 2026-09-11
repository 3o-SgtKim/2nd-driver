import { Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AccentColors, Spacing } from '@/constants/theme';

type AccentKey = keyof typeof AccentColors;

type LogRowProps = {
  title: string;
  subtitle: string;
  meta?: string;
  accent?: AccentKey;
  onPress?: () => void;
  onDelete?: () => void;
};

export function LogRow({ title, subtitle, meta, accent, onPress, onDelete }: LogRowProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const accentTheme = accent ? AccentColors[accent] : null;

  const rowBg = accentTheme
    ? dark
      ? accentTheme.surfaceDark
      : accentTheme.surface
    : undefined;
  const rowBorder = accentTheme
    ? dark
      ? accentTheme.borderDark
      : accentTheme.border
    : undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.row,
          rowBg ? { backgroundColor: rowBg } : undefined,
          rowBorder ? { borderWidth: 1, borderColor: rowBorder } : undefined,
        ]}>
        {accent && (
          <View
            style={[
              styles.accentStrip,
              { backgroundColor: accentTheme!.solid },
            ]}
          />
        )}
        <View style={styles.textBlock}>
          <ThemedText type="smallBold">{title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        </View>
        {meta ? (
          <ThemedText
            type="smallBold"
            style={[
              styles.meta,
              accentTheme
                ? { color: dark ? accentTheme.textDark : accentTheme.text }
                : undefined,
            ]}>
            {meta}
          </ThemedText>
        ) : null}
        {onDelete && (
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}>
            <ThemedText style={styles.deleteIcon}>✕</ThemedText>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingRight: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    overflow: 'hidden',
  },
  accentStrip: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  textBlock: {
    flex: 1,
    gap: Spacing.half,
    paddingLeft: Spacing.two,
  },
  meta: {
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.75,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(198, 40, 40, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.one,
  },
  deleteBtnPressed: {
    backgroundColor: 'rgba(198, 40, 40, 0.25)',
  },
  deleteIcon: {
    color: '#c62828',
    fontSize: 13,
    fontWeight: '700',
  },
});
