import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { FabButton } from '@/components/forms';
import { LogRow } from '@/components/log-row';
import { NeedsVehicle } from '@/components/needs-vehicle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { VehicleSelector } from '@/components/vehicle-selector';
import { Spacing } from '@/constants/theme';
import { formatCurrency, formatDateDisplay, formatNumber } from '@/domain/stats';
import { FUEL_TYPE_LABELS } from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';
import { useTheme } from '@/hooks/use-theme';

export default function FuelListScreen() {
  const garage = useGarage();
  const theme = useTheme();
  const router = useRouter();

  if (garage.loading) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={theme.text} />
      </Screen>
    );
  }

  if (!garage.vehicle) {
    return (
      <Screen>
        <ThemedText type="subtitle">Combustível</ThemedText>
        <NeedsVehicle />
      </Screen>
    );
  }

  const logs = [...garage.fuelLogs].sort((a, b) => b.date.localeCompare(a.date));
  const unit = garage.vehicle.odometerUnit;
  const fuelUnit = garage.vehicle.fuelUnit;

  function confirmDelete(id: string) {
    Alert.alert('Excluir abastecimento', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => garage.deleteFuelLog(id),
      },
    ]);
  }

  return (
    <Screen topHeader={<VehicleSelector />}>
      <ThemedText type="subtitle">Combustível</ThemedText>

      {logs.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Nenhum abastecimento registrado.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {logs.map((log) => (
            <LogRow
              key={log.id}
              accent="fuel"
              title={`${formatDateDisplay(log.date)} · ${FUEL_TYPE_LABELS[log.fuelType] ?? log.fuelType}`}
              subtitle={`${formatNumber(log.odometer)} ${unit} · ${formatNumber(log.volume, 1)} ${fuelUnit}${log.isFullTank ? ' · tanque cheio' : ''}`}
              meta={formatCurrency(log.totalCost, garage.vehicle!.currency)}
              onPress={() => router.push(`/fuel/${log.id}`)}
              onDelete={() => confirmDelete(log.id)}
            />
          ))}
        </View>
      )}

      <FabButton
        label="+ Novo abastecimento"
        accent="fuel"
        onPress={() => router.push('/fuel/new')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
});
