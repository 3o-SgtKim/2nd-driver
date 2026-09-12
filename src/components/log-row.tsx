import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { PressableScale } from '@/components/motion';
import { ThemedText } from '@/components/themed-text';
import { AccentColors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

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
  const theme = useTheme();
  const accentTheme = accent ? AccentColors[accent] : null;
  const iconName = accent === 'maintenance' ? 'construct-outline' : 'water-outline';

  return (
    <PressableScale onPress={onPress} style={Shadows.card}>
      <View style={[styles.row, { backgroundColor: theme.backgroundElement }]}>
        {accentTheme ? (
          <View style={[styles.iconWell, { backgroundColor: accentTheme.surface }]}>
            <AppIcon name={iconName} size={18} color={accentTheme.solid} />
          </View>
        ) : null}
        <View style={styles.textBlock}>
          <ThemedText type="smallBold" style={styles.title}>
            {title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {subtitle}
          </ThemedText>
        </View>
        {meta ? (
          <ThemedText
            type="heading"
            style={[
              styles.meta,
              accentTheme ? { color: accentTheme.solid } : undefined,
            ]}>
            {meta}
          </ThemedText>
        ) : null}
        {onDelete && (
          <PressableScale onPress={onDelete} style={styles.deleteBtn}>
            <AppIcon name="close" size={14} color="#DC2626" />
          </PressableScale>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingRight: 12,
    paddingLeft: 12,
    paddingVertical: 14,
    borderRadius: Radius.lg,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
  },
  meta: {
    textAlign: 'right',
    fontSize: 20,
    lineHeight: 22,
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220, 38, 38, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
