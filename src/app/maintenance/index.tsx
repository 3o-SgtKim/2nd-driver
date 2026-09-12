import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Cluster } from '@/components/cluster';
import { EmptyState } from '@/components/empty-state';
import { FabButton } from '@/components/forms';
import { LogRow } from '@/components/log-row';
import { FadeIn } from '@/components/motion';
import { NeedsVehicle } from '@/components/needs-vehicle';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { VehicleSelector } from '@/components/vehicle-selector';
import { AccentColors, Spacing } from '@/constants/theme';
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
        <PageHeader title="Manutenção" subtitle="Cadastre um veículo para começar." />
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
      <Cluster
        eyebrow="Registros"
        title="Manutenção"
        accent="maintenance"
        imageUri={garage.vehicle.photoUri}
        outlined
        meta={[
          {
            label: 'Neste veículo',
            value: `${logs.length} serviço${logs.length === 1 ? '' : 's'}`,
          },
        ]}
      />

      {logs.length === 0 ? (
        <EmptyState
          icon="construct-outline"
          title="Nenhuma manutenção"
          subtitle="Toque no botão abaixo para registrar o primeiro serviço."
          accent={AccentColors.maintenance.solid}
        />
      ) : (
        <View style={styles.list}>
          {logs.map((log, index) => {
            const label = getMaintenanceLabel(log.maintenanceItemId, log.customTitle);
            return (
              <FadeIn key={log.id} delay={index * 40}>
                <LogRow
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
              </FadeIn>
            );
          })}
        </View>
      )}

      <FabButton
        label="Nova manutenção"
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
