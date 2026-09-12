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
        <PageHeader title="Combustível" subtitle="Cadastre um veículo para começar." />
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
      <Cluster
        eyebrow="Registros"
        title="Combustível"
        accent="fuel"
        imageUri={garage.vehicle.photoUri}
        outlined
        meta={[
          {
            label: 'Neste veículo',
            value: `${logs.length} abastecimento${logs.length === 1 ? '' : 's'}`,
          },
        ]}
      />

      {logs.length === 0 ? (
        <EmptyState
          icon="water-outline"
          title="Nenhum abastecimento"
          subtitle="Toque no botão abaixo para registrar o primeiro."
          accent={AccentColors.fuel.solid}
        />
      ) : (
        <View style={styles.list}>
          {logs.map((log, index) => (
            <FadeIn key={log.id} delay={index * 40}>
              <LogRow
                accent="fuel"
                title={`${formatDateDisplay(log.date)} · ${FUEL_TYPE_LABELS[log.fuelType] ?? log.fuelType}`}
                subtitle={`${formatNumber(log.odometer)} ${unit} · ${formatNumber(log.volume, 1)} ${fuelUnit}${log.isFullTank ? ' · tanque cheio' : ''}`}
                meta={formatCurrency(log.totalCost, garage.vehicle!.currency)}
                onPress={() => router.push(`/fuel/${log.id}`)}
                onDelete={() => confirmDelete(log.id)}
              />
            </FadeIn>
          ))}
        </View>
      )}

      <FabButton
        label="Novo abastecimento"
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
