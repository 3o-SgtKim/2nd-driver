import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function NeedsVehicle() {
  return (
    <ThemedView type="backgroundElement" style={styles.box}>
      <ThemedText type="subtitle" style={styles.title}>
        Cadastre seu veículo
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        Para registrar combustível e manutenção, comece informando os dados do carro.
      </ThemedText>
      <Link href="/vehicle" asChild>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
          <ThemedText type="smallBold">Ir para Veículo</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(60, 135, 247, 0.15)',
  },
  pressed: {
    opacity: 0.7,
  },
});
