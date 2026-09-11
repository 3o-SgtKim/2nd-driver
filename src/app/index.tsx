import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { LogRow } from '@/components/log-row';
import { NeedsVehicle } from '@/components/needs-vehicle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehicleSelector } from '@/components/vehicle-selector';
import { AccentColors, Spacing } from '@/constants/theme';
import {
  formatCurrency,
  formatDateDisplay,
  formatNumber,
  getAllNextServices,
  getFuelEconomy,
  getLastOdometer,
  getLatestFuelLog,
} from '@/domain/stats';
import { FUEL_TYPE_LABELS, getMaintenanceLabel } from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const garage = useGarage();
  const theme = useTheme();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';

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
        <ThemedText type="subtitle">Início</ThemedText>
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
      <View style={styles.header}>
        <ThemedText themeColor="textSecondary">
          {lastOdometer != null ? `${formatNumber(lastOdometer)} ${unit}` : 'Resumo do veículo'}
        </ThemedText>
      </View>

      {/* 1. Consumo */}
      <AccentCard
        accent="fuel"
        title="Consumo"
        dark={dark}>
        <ThemedText
          type="subtitle"
          style={{
            color: dark ? fuelAccent.textDark : fuelAccent.text,
            fontSize: 28,
            lineHeight: 34,
          }}>
          {economy
            ? `${formatNumber(economy.value, 1)} ${economy.unitLabel}`
            : '—'}
        </ThemedText>
        {!economy && (
          <ThemedText type="small" themeColor="textSecondary">
            Precisa de 2 tanques cheios para calcular
          </ThemedText>
        )}
      </AccentCard>

      {/* 2. Próximas manutenções */}
      <View style={styles.section}>
        <ThemedText type="smallBold">Próximas manutenções</ThemedText>
        {nextServices.length === 0 ? (
          <ThemedText type="small" themeColor="textSecondary">
            Nenhuma pendência
          </ThemedText>
        ) : (
          nextServices.map((svc) => (
            <Link key={svc.log.id} href={`/maintenance/${svc.log.id}`} asChild>
              <Pressable>
                <LogRow
                  accent="maintenance"
                  title={getMaintenanceLabel(svc.log.maintenanceItemId, svc.log.customTitle)}
                  subtitle={svc.dueLabel}
                />
              </Pressable>
            </Link>
          ))
        )}
      </View>

      {/* 3. Último abastecimento */}
      <View style={styles.section}>
        <ThemedText type="smallBold">Último abastecimento</ThemedText>
        {latestFuel ? (
          <Link href={`/fuel/${latestFuel.id}`} asChild>
            <Pressable>
              <LogRow
                accent="fuel"
                title={`${FUEL_TYPE_LABELS[latestFuel.fuelType] ?? latestFuel.fuelType} · ${formatDateDisplay(latestFuel.date)}`}
                subtitle={`${formatNumber(latestFuel.odometer)} ${unit} · ${formatNumber(latestFuel.volume, 1)} ${garage.vehicle.fuelUnit}`}
                meta={formatCurrency(latestFuel.totalCost, garage.vehicle.currency)}
              />
            </Pressable>
          </Link>
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Nenhum abastecimento ainda
          </ThemedText>
        )}
      </View>
    </Screen>
  );
}

function AccentCard({
  accent,
  title,
  dark,
  children,
}: {
  accent: keyof typeof AccentColors;
  title: string;
  dark: boolean;
  children: ReactNode;
}) {
  const colors = AccentColors[accent];
  return (
    <View
      style={[
        styles.accentCard,
        {
          backgroundColor: dark ? colors.surfaceDark : colors.surface,
          borderColor: dark ? colors.borderDark : colors.border,
        },
      ]}>
      <ThemedText
        type="small"
        style={{ color: dark ? colors.textDark : colors.text, fontWeight: '600' }}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  accentCard: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  section: {
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.7,
  },
});
