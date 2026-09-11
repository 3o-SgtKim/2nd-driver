import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { Chip } from '@/components/forms';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehicleSelector } from '@/components/vehicle-selector';
import { AccentColors, Spacing } from '@/constants/theme';
import {
  displayToIso,
  formatCurrency,
  formatDateDisplay,
  formatNumber,
  getFuelEconomy,
  getLastOdometer,
  tireCorrectionFactor,
  todayIsoDate,
} from '@/domain/stats';
import {
  FUEL_TYPE_LABELS,
  getMaintenanceLabel,
  type FuelLog,
  type FuelType,
  type MaintenanceLog,
} from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';

type Period = '30d' | '90d' | '6m' | '1y' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: '30d', label: '30 dias' },
  { key: '90d', label: '90 dias' },
  { key: '6m', label: '6 meses' },
  { key: '1y', label: '1 ano' },
  { key: 'all', label: 'Tudo' },
];

function periodStartIso(period: Period): string | null {
  if (period === 'all') return null;
  const now = new Date();
  switch (period) {
    case '30d':
      now.setDate(now.getDate() - 30);
      break;
    case '90d':
      now.setDate(now.getDate() - 90);
      break;
    case '6m':
      now.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function filterByPeriod<T extends { date: string }>(items: T[], period: Period): T[] {
  const start = periodStartIso(period);
  if (!start) return items;
  return items.filter((item) => item.date >= start);
}

export default function ReportsScreen() {
  const garage = useGarage();
  const scheme = useColorScheme();
  const dark = scheme === 'dark';
  const [period, setPeriod] = useState<Period>('all');

  const fuelLogs = useMemo(
    () => filterByPeriod([...garage.fuelLogs].sort((a, b) => a.date.localeCompare(b.date)), period),
    [garage.fuelLogs, period]
  );
  const maintLogs = useMemo(
    () => filterByPeriod([...garage.maintenanceLogs].sort((a, b) => a.date.localeCompare(b.date)), period),
    [garage.maintenanceLogs, period]
  );

  const vehicle = garage.vehicle;

  if (!vehicle) {
    return (
      <Screen>
        <ThemedText type="subtitle">Relatórios</ThemedText>
        <ThemedText themeColor="textSecondary">Cadastre um veículo para ver relatórios.</ThemedText>
      </Screen>
    );
  }

  const factor = tireCorrectionFactor(vehicle.tireCorrection);
  const economy = getFuelEconomy(fuelLogs, vehicle);
  const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.totalCost, 0);
  const totalFuelVolume = fuelLogs.reduce((sum, l) => sum + l.volume, 0);
  const totalMaintCost = maintLogs.reduce((sum, l) => sum + (l.cost ?? 0), 0);
  const totalCost = totalFuelCost + totalMaintCost;

  const odometerRange =
    fuelLogs.length >= 2
      ? (fuelLogs[fuelLogs.length - 1].odometer - fuelLogs[0].odometer) * factor
      : null;

  const avgCostPerFill = fuelLogs.length > 0 ? totalFuelCost / fuelLogs.length : null;
  const avgPricePerLiter = totalFuelVolume > 0 ? totalFuelCost / totalFuelVolume : null;
  const costPerKm = odometerRange && odometerRange > 0 ? totalCost / odometerRange : null;

  // Fuel type breakdown
  const fuelTypeMap = new Map<FuelType, { count: number; volume: number; cost: number }>();
  for (const log of fuelLogs) {
    const entry = fuelTypeMap.get(log.fuelType) ?? { count: 0, volume: 0, cost: 0 };
    entry.count += 1;
    entry.volume += log.volume;
    entry.cost += log.totalCost;
    fuelTypeMap.set(log.fuelType, entry);
  }

  // Top maintenance costs
  const topMaint = [...maintLogs]
    .filter((l) => l.cost != null && l.cost > 0)
    .sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0))
    .slice(0, 5);

  const fuelColor = AccentColors.fuel;
  const maintColor = AccentColors.maintenance;

  return (
    <Screen topHeader={<VehicleSelector />}>
      <ThemedText type="subtitle">Relatórios</ThemedText>

      {/* Period selector */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <Chip
            key={p.key}
            label={p.label}
            selected={period === p.key}
            onPress={() => setPeriod(p.key)}
          />
        ))}
      </View>

      {/* Overview cards */}
      <View style={styles.cardGrid}>
        <StatMini label="Custo total" value={formatCurrency(totalCost, vehicle.currency)} />
        <StatMini
          label="Combustível"
          value={formatCurrency(totalFuelCost, vehicle.currency)}
          color={dark ? fuelColor.textDark : fuelColor.text}
        />
        <StatMini
          label="Manutenção"
          value={formatCurrency(totalMaintCost, vehicle.currency)}
          color={dark ? maintColor.textDark : maintColor.text}
        />
        <StatMini
          label="Abastecimentos"
          value={String(fuelLogs.length)}
        />
        <StatMini
          label="Manutenções"
          value={String(maintLogs.length)}
        />
        <StatMini
          label="Volume total"
          value={`${formatNumber(totalFuelVolume, 1)} ${vehicle.fuelUnit}`}
        />
      </View>

      {/* Consumption */}
      <StatMini
        label="Consumo médio"
        value={economy ? `${formatNumber(economy.value, 1)} ${economy.unitLabel}` : '—'}
        color={dark ? fuelColor.textDark : fuelColor.text}
      />
      <View style={styles.consumptionNote}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.noteText}>
          Calculado pelo{' '}
        </ThemedText>
        <Pressable
          onPress={() =>
            Alert.alert(
              'Método do tanque cheio',
              'Para calcular o consumo, encha o tanque completamente e marque "tanque cheio" ao registrar. ' +
              'Faça isso pelo menos duas vezes.\n\n' +
              'O app mede a distância percorrida entre os dois tanques cheios e divide pelo combustível gasto. ' +
              'Se você abastecer parcialmente no meio, sem problema — o app conta tudo junto.\n\n' +
              'Sempre que quiser atualizar o consumo médio, basta encher o tanque novamente e registrar como tanque cheio.\n\n' +
              '⚠️ Sem pelo menos 2 registros de tanque cheio, o consumo não será calculado.',
            )
          }>
          <ThemedText type="small" style={styles.noteLink}>
            método do tanque cheio
          </ThemedText>
        </Pressable>
      </View>
      {avgPricePerLiter != null && (
        <StatMini
          label={`Preço médio por ${vehicle.fuelUnit}`}
          value={formatCurrency(avgPricePerLiter, vehicle.currency)}
        />
      )}
      {avgCostPerFill != null && (
        <StatMini
          label="Custo médio por abastecimento"
          value={formatCurrency(avgCostPerFill, vehicle.currency)}
        />
      )}
      {costPerKm != null && (
        <StatMini
          label={`Custo por ${vehicle.odometerUnit}`}
          value={formatCurrency(costPerKm, vehicle.currency)}
        />
      )}
      {/* Fuel type breakdown */}
      {fuelTypeMap.size > 0 && (
        <SectionCard title="Por tipo de combustível" accent="fuel" dark={dark}>
          {[...fuelTypeMap.entries()].map(([type, data]) => (
            <View key={type} style={styles.breakdownRow}>
              <ThemedText type="smallBold">
                {FUEL_TYPE_LABELS[type] ?? type}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {data.count}x · {formatNumber(data.volume, 1)} {vehicle.fuelUnit} · {formatCurrency(data.cost, vehicle.currency)}
              </ThemedText>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Top maintenance costs */}
      {topMaint.length > 0 && (
        <SectionCard title="Manutenções mais caras" accent="maintenance" dark={dark}>
          {topMaint.map((log) => (
            <View key={log.id} style={styles.breakdownRow}>
              <ThemedText type="smallBold">
                {getMaintenanceLabel(log.maintenanceItemId, log.customTitle)}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatDateDisplay(log.date)} · {formatCurrency(log.cost!, vehicle.currency)}
              </ThemedText>
            </View>
          ))}
        </SectionCard>
      )}

      {fuelLogs.length === 0 && maintLogs.length === 0 && (
        <ThemedText themeColor="textSecondary">
          Registre abastecimentos e manutenções para gerar relatórios.
        </ThemedText>
      )}
    </Screen>
  );
}

function StatMini({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <ThemedView type="backgroundElement" style={styles.statMini}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={color ? { color } : undefined}>
        {value}
      </ThemedText>
    </ThemedView>
  );
}

function SectionCard({
  title,
  accent,
  dark,
  children,
}: {
  title: string;
  accent: keyof typeof AccentColors;
  dark: boolean;
  children: React.ReactNode;
}) {
  const colors = AccentColors[accent];
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: dark ? colors.surfaceDark : colors.surface,
          borderColor: dark ? colors.borderDark : colors.border,
        },
      ]}>
      <ThemedText
        type="smallBold"
        style={{ color: dark ? colors.textDark : colors.text }}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statMini: {
    gap: 2,
    padding: Spacing.three,
    borderRadius: 12,
    minWidth: 140,
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
  },
  consumptionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.two,
  },
  noteText: {
    fontSize: 12,
  },
  noteLink: {
    fontSize: 12,
    textDecorationLine: 'underline',
    color: '#3B82F6',
  },
  breakdownRow: {
    gap: 2,
  },
});
