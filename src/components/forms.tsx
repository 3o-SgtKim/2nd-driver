import { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
  type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AccentColors, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
    </View>
  );
}

export function TextField(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[
        styles.input,
        {
          color: theme.text,
          backgroundColor: theme.backgroundElement,
          borderColor: theme.backgroundSelected,
        },
        props.style,
      ]}
    />
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'danger';
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  tone = 'primary',
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        tone === 'danger' && styles.danger,
        (pressed || disabled) && styles.pressed,
      ]}>
      <ThemedText type="smallBold" style={styles.buttonLabel}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

type AccentKey = keyof typeof AccentColors;

type FabButtonProps = {
  label: string;
  onPress: () => void;
  accent: AccentKey;
};

export function FabButton({ label, onPress, accent }: FabButtonProps) {
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const colors = AccentColors[accent];

  return (
    <View style={styles.fabWrapper}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.solid,
            shadowColor: colors.solid,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <ThemedText type="default" style={styles.fabLabel}>
          {label}
        </ThemedText>
      </Pressable>
    </View>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  color?: string;
};

export function Chip({ label, selected, onPress, color }: ChipProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {color && selected ? (
        <View style={[styles.chip, { backgroundColor: color }]}>
          <ThemedText type="small" style={{ color: '#ffffff' }}>
            {label}
          </ThemedText>
        </View>
      ) : (
        <ThemedView
          type={selected ? 'backgroundSelected' : 'backgroundElement'}
          style={styles.chip}>
          <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
            {label}
          </ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  danger: {
    backgroundColor: '#c62828',
  },
  buttonLabel: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.7,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
  },
  fabWrapper: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
  },
  fab: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
  },
});
