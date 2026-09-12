import { StyleSheet, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  icon: AppIconName;
  title: string;
  subtitle: string;
  accent?: string;
};

export function EmptyState({ icon, title, subtitle, accent }: EmptyStateProps) {
  const theme = useTheme();
  const color = accent ?? theme.textSecondary;

  return (
    <View style={styles.box}>
      <View style={[styles.well, { backgroundColor: `${color}22` }]}>
        <AppIcon name={icon} size={28} color={color} />
      </View>
      <ThemedText type="heading" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  well: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 26,
    lineHeight: 30,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
