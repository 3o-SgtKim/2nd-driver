import { ReactNode, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AppIcon } from '@/components/app-icon';
import { PressableScale } from '@/components/motion';
import { ThemedText } from '@/components/themed-text';
import { AccentColors, Chrome, Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FieldProps = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: FieldProps) {
  return (
    <View style={styles.field}>
      <ThemedText type="eyebrow" themeColor="textSecondary" style={styles.fieldLabel}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

export function TextField(props: TextInputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const hasValue = String(props.value ?? '').length > 0;

  return (
    <View>
      <TextInput
        placeholderTextColor={theme.placeholder}
        {...props}
        onFocus={(event) => {
          setFocused(true);
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          props.onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            color: theme.text,
            backgroundColor: theme.background,
            borderColor: focused ? AccentColors.maintenance.solid : theme.backgroundSelected,
            borderWidth: focused ? 1.5 : 1,
          },
          (focused || hasValue) && styles.inputActive,
          props.style,
        ]}
      />
    </View>
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
  const colors = tone === 'danger' ? (['#DC2626', '#9F1239'] as const) : AccentColors.maintenance.gradient;

  return (
    <PressableScale
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[disabled && styles.disabled, Shadows.card]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.button}>
        <ThemedText type="smallBold" style={styles.buttonLabel}>
          {label}
        </ThemedText>
      </LinearGradient>
    </PressableScale>
  );
}

type AccentKey = keyof typeof AccentColors;

type FabButtonProps = {
  label: string;
  onPress: () => void;
  accent: AccentKey;
};

export function FabButton({ label, onPress, accent }: FabButtonProps) {
  const colors = AccentColors[accent];

  return (
    <View style={styles.fabWrapper}>
      <PressableScale onPress={onPress} style={Shadows.raised}>
        <LinearGradient colors={colors.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fab}>
          <AppIcon name="add" size={20} color="#ffffff" />
          <ThemedText type="default" style={styles.fabLabel}>
            {label}
          </ThemedText>
        </LinearGradient>
      </PressableScale>
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
  const theme = useTheme();

  const backgroundColor =
    color && selected ? color : selected ? Chrome.surface : theme.background;
  const textColor = selected ? Chrome.text : theme.textSecondary;

  return (
    <PressableScale onPress={onPress}>
      <View
        style={[
          styles.chip,
          { backgroundColor },
          selected && !color ? styles.chipSelected : undefined,
        ]}>
        <ThemedText type="smallBold" style={{ color: textColor }}>
          {label}
        </ThemedText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  fieldLabel: {
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 13,
    fontSize: 16,
    fontFamily: 'DMSans_500Medium',
  },
  inputActive: {
    paddingTop: 14,
  },
  button: {
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.55,
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    borderColor: 'rgba(244, 239, 230, 0.16)',
  },
  fabWrapper: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
  },
  fab: {
    borderRadius: Radius.lg,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  fabLabel: {
    color: '#ffffff',
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
  },
});
