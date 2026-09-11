import { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  /** Rendered centered above the content (e.g. vehicle selector) */
  topHeader?: ReactNode;
};

export function Screen({ children, scroll = true, contentStyle, topHeader }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const paddingBottom = insets.bottom + BottomTabInset + Spacing.three;
  const topPadding = Platform.OS === 'web' ? Spacing.six : insets.top + Spacing.three;

  const content = (
    <View
      style={[
        styles.content,
        {
          paddingTop: topHeader ? 0 : topPadding,
          paddingBottom,
          paddingLeft: Spacing.four + insets.left,
          paddingRight: Spacing.four + insets.right,
        },
        contentStyle,
      ]}>
      {topHeader && (
        <View style={[styles.topHeader, { paddingTop: topPadding }]}>
          {topHeader}
        </View>
      )}
      {children}
    </View>
  );

  if (!scroll) {
    return (
      <ThemedView style={[styles.root, { backgroundColor: theme.background }]}>
        {content}
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled">
      {content}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  topHeader: {
    alignItems: 'center' as const,
    marginBottom: Spacing.one,
  },
});
