import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { PressableScale } from '@/components/motion';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Radius, Shadows, Spacing } from '@/constants/theme';

export function NeedsVehicle() {
  return (
    <ThemedView type="backgroundElement" style={[styles.box, Shadows.card]}>
      <AppIcon name="car-outline" size={36} color="#3B82F6" />
      <ThemedText type="heading">
        Cadastre seu veículo
      </ThemedText>
      <ThemedText themeColor="textSecondary">
        Para registrar combustível e manutenção, comece informando os dados do carro.
      </ThemedText>
      <Link href="/vehicle" asChild>
        <PressableScale style={styles.button}>
          <ThemedText type="smallBold" style={styles.buttonText}>
            Ir para Garagem
          </ThemedText>
        </PressableScale>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  box: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.lg,
    alignItems: 'flex-start',
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.sm,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  buttonText: {
    color: '#3B82F6',
  },
});
