import { Link } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { Cluster } from '@/components/cluster';
import { EmptyState } from '@/components/empty-state';
import { LogRow } from '@/components/log-row';
import { FadeIn, PressableScale } from '@/components/motion';
import { NeedsVehicle } from '@/components/needs-vehicle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { VehicleSelector } from '@/components/vehicle-selector';
import { AccentColors, Radius, Shadows, Spacing } from '@/constants/theme';
import {
  formatCurrency,
  formatDateDisplay,
  formatNumber,
  getAllNextServices,
  getFuelEconomy,
  getLastOdometer,
  getLatestFuelLog,
  getMaintenanceProgress,
} from '@/domain/stats';
import { FUEL_TYPE_LABELS, getMaintenanceLabel, getVehicleDisplayName } from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const garage = useGarage();
  const theme = useTheme();

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
        <ThemedText type="heading">Início</ThemedText>
        <NeedsVehicle />
      </Screen>
    );
  }

  const lastOdometer = getLastOdometer(garage);
  const latestFuel = getLatestFuelLog(garage.fuelLogs);
  const economy = getFuelEconomy(garage.fuelLogs, garage.vehicle);
  const nextServices = getAllNextServices(garage.maintenanceLogs, lastOdometer);
  const unit = garage.vehicle.odometerUnit;
  const fuelAccent = AccentColors.fuel;
  const maintAccent = AccentColors.maintenance;

  return (
    <Screen topHeader={<VehicleSelector />}>
      <FadeIn>
        <Cluster
          eyebrow={getVehicleDisplayName(garage.vehicle)}
          title={economy ? formatNumber(economy.value, 1) : '—'}
          subtitle={economy ? economy.unitLabel : 'consumo indisponível'}
          accent="fuel"
          size="display"
          imageUri={garage.vehicle.photoUri}
          meta={[
            {
              label: 'Odômetro',
              value: lastOdometer != null ? `${formatNumber(lastOdometer)} ${unit}` : '—',
            },
            {
              label: 'Último abastecimento',
              value: latestFuel
                ? formatCurrency(latestFuel.totalCost, garage.vehicle.currency)
                : '—',
            },
          ]}
        />
      </FadeIn>

      <FadeIn delay={70} style={styles.section}>
        <View style={styles.sectionHead}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Agenda
          </ThemedText>
          <ThemedText type="heading">Próximas manutenções</ThemedText>
        </View>
        {nextServices.length === 0 ? (
          <EmptyState
            icon="construct-outline"
            title="Nada pendente"
            subtitle="Quando houver próxima data ou odômetro, eles aparecem aqui."
            accent={maintAccent.solid}
          />
        ) : (
          nextServices.map((svc) => {
            const progress = getMaintenanceProgress(svc.log, lastOdometer);
            const pct = progress != null ? Math.round(progress * 100) : null;
            return (
              <Link key={svc.log.id} href={`/maintenance/${svc.log.id}`} asChild>
                <PressableScale
                  style={StyleSheet.flatten([
                    styles.serviceCard,
                    Shadows.card,
                    { backgroundColor: theme.backgroundElement },
                  ])}>
                  <View style={styles.serviceRow}>
                    <View style={styles.serviceIcon}>
                      <AppIcon name="construct-outline" size={18} color={maintAccent.solid} />
                    </View>
                    <View style={styles.serviceText}>
                      <ThemedText type="smallBold">
                        {getMaintenanceLabel(svc.log.maintenanceItemId, svc.log.customTitle)}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {svc.dueLabel}
                      </ThemedText>
                    </View>
                    {pct != null && (
                      <ThemedText type="smallBold" style={{ color: maintAccent.solid }}>
                        {pct}%
                      </ThemedText>
                    )}
                  </View>
                  {progress != null && (
                    <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSelected }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.round(progress * 100)}%`,
                            backgroundColor: maintAccent.solid,
                          },
                        ]}
                      />
                    </View>
                  )}
                </PressableScale>
              </Link>
            );
          })
        )}
      </FadeIn>

      <FadeIn delay={130} style={styles.section}>
        <View style={styles.sectionHead}>
          <ThemedText type="eyebrow" themeColor="textSecondary">
            Histórico
          </ThemedText>
          <ThemedText type="heading">Último abastecimento</ThemedText>
        </View>
        {latestFuel ? (
          <Link href={`/fuel/${latestFuel.id}`} asChild>
            <PressableScale>
              <LogRow
                accent="fuel"
                title={FUEL_TYPE_LABELS[latestFuel.fuelType] ?? latestFuel.fuelType}
                subtitle={`${formatDateDisplay(latestFuel.date)} · ${formatNumber(latestFuel.odometer)} ${unit}`}
                meta={formatCurrency(latestFuel.totalCost, garage.vehicle.currency)}
              />
            </PressableScale>
          </Link>
        ) : (
          <EmptyState
            icon="water-outline"
            title="Nenhum abastecimento"
            subtitle="Registre um tanque cheio para começar o histórico."
            accent={fuelAccent.solid}
          />
        )}
      </FadeIn>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  sectionHead: {
    gap: 4,
    marginBottom: 4,
  },
  serviceCard: {
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceText: {
    flex: 1,
    gap: 2,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
