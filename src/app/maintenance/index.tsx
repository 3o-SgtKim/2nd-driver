import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { FabButton } from '@/components/forms';
import { LogRow } from '@/components/log-row';
import { NeedsVehicle } from '@/components/needs-vehicle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { VehicleSelector } from '@/components/vehicle-selector';
import { Spacing } from '@/constants/theme';
import { formatCurrency, formatDateDisplay, formatNumber } from '@/domain/stats';
import { getMaintenanceLabel } from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';
import { useTheme } from '@/hooks/use-theme';

export default function MaintenanceListScreen() {
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
        <ThemedText type="subtitle">Manutenção</ThemedText>
        <NeedsVehicle />
      </Screen>
    );
  }

  const logs = [...garage.maintenanceLogs].sort((a, b) => b.date.localeCompare(a.date));
  const unit = garage.vehicle.odometerUnit;

  function confirmDelete(id: string) {
    Alert.alert('Excluir manutenção', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => garage.deleteMaintenanceLog(id),
      },
    ]);
  }

  return (
    <Screen topHeader={<VehicleSelector />}>
      <ThemedText type="subtitle">Manutenção</ThemedText>

      {logs.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Nenhuma manutenção registrada.
        </ThemedText>
      ) : (
        <View style={styles.list}>
          {logs.map((log) => {
            const label = getMaintenanceLabel(log.maintenanceItemId, log.customTitle);
            return (
              <LogRow
                key={log.id}
                accent="maintenance"
                title={label}
                subtitle={`${formatDateDisplay(log.date)} · ${formatNumber(log.odometer)} ${unit}`}
                meta={
                  log.cost != null
                    ? formatCurrency(log.cost, garage.vehicle!.currency)
                    : undefined
                }
                onPress={() => router.push(`/maintenance/${log.id}`)}
                onDelete={() => confirmDelete(log.id)}
              />
            );
          })}
        </View>
      )}

      <FabButton
        label="+ Nova manutenção"
        accent="maintenance"
        onPress={() => router.push('/maintenance/new')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
});
