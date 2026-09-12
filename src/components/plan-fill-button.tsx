import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type FieldWithPlanProps = {
  children: ReactNode;
  showPlan: boolean;
  onPlan: () => void;
};

export function FieldWithPlan({ children, showPlan, onPlan }: FieldWithPlanProps) {
  return (
    <View style={styles.row}>
      <View style={styles.flex}>{children}</View>
      {showPlan ? (
        <Pressable
          onPress={onPlan}
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
          <View style={styles.inner}>
            <AppIcon name="flash" size={13} color="#3B82F6" />
            <ThemedText type="small" style={styles.label}>
              Plano
            </ThemedText>
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  flex: {
    flex: 1,
  },
  btn: {
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
