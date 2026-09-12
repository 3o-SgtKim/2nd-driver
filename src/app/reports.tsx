import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, useColorScheme, View } from 'react-native';

import { Cluster } from '@/components/cluster';
import { EmptyState } from '@/components/empty-state';
import { FormSection } from '@/components/form-section';
import { Chip } from '@/components/forms';
import { PageHeader } from '@/components/page-header';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { VehicleSelector } from '@/components/vehicle-selector';
import { AccentColors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  formatCurrency,
  formatDateDisplay,
  formatNumber,
  getFuelEconomy,
  tireCorrectionFactor,
} from '@/domain/stats';
import {
  FUEL_TYPE_LABELS,
  getMaintenanceLabel,
  type FuelType,
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
        <PageHeader title="Relatórios" subtitle="Cadastre um veículo para ver relatórios." />
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
      <Cluster
        eyebrow="Custo total"
        title={formatCurrency(totalCost, vehicle.currency)}
        accent="maintenance"
        size="display"
        imageUri={vehicle.photoUri}>
        {totalCost > 0 ? (
          <>
            <View style={styles.splitTrack}>
              <View style={[styles.splitFuel, { flex: Math.max(totalFuelCost, 0.01) }]} />
              <View style={[styles.splitMaint, { flex: Math.max(totalMaintCost, 0.01) }]} />
            </View>
            <View style={styles.heroMeta}>
              <View style={styles.heroMetaItem}>
                <ThemedText type="eyebrow" style={styles.heroMetaLabel}>
                  Combustível
                </ThemedText>
                <ThemedText type="smallBold" style={styles.heroMetaFuel}>
                  {formatCurrency(totalFuelCost, vehicle.currency)}
                </ThemedText>
              </View>
              <View style={styles.heroMetaDivider} />
              <View style={styles.heroMetaItem}>
                <ThemedText type="eyebrow" style={styles.heroMetaLabel}>
                  Manutenção
                </ThemedText>
                <ThemedText type="smallBold" style={styles.heroMetaMaint}>
                  {formatCurrency(totalMaintCost, vehicle.currency)}
                </ThemedText>
              </View>
            </View>
          </>
        ) : null}
      </Cluster>

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

      <View style={styles.tileRow}>
        <StatTile
          label="Abastecimentos"
          value={String(fuelLogs.length)}
          color={dark ? fuelColor.textDark : fuelColor.text}
        />
        <StatTile
          label="Manutenções"
          value={String(maintLogs.length)}
          color={dark ? maintColor.textDark : maintColor.text}
        />
      </View>
      <StatTile
        label="Volume total"
        value={`${formatNumber(totalFuelVolume, 1)} ${vehicle.fuelUnit}`}
      />

      <FormSection title="Médias">
        <MetricRow
          label="Consumo médio"
          value={economy ? `${formatNumber(economy.value, 1)} ${economy.unitLabel}` : '—'}
          color={dark ? fuelColor.textDark : fuelColor.text}
        />
        {avgPricePerLiter != null ? (
          <MetricRow
            label={`Preço médio por ${vehicle.fuelUnit}`}
            value={formatCurrency(avgPricePerLiter, vehicle.currency)}
          />
        ) : null}
        {avgCostPerFill != null ? (
          <MetricRow
            label="Custo médio por abastecimento"
            value={formatCurrency(avgCostPerFill, vehicle.currency)}
          />
        ) : null}
        {costPerKm != null ? (
          <MetricRow
            label={`Custo por ${vehicle.odometerUnit}`}
            value={formatCurrency(costPerKm, vehicle.currency)}
          />
        ) : null}
      </FormSection>
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

      {fuelTypeMap.size > 0 && (
        <FormSection title="Por tipo de combustível">
          {[...fuelTypeMap.entries()].map(([type, data]) => (
            <MetricRow
              key={type}
              label={FUEL_TYPE_LABELS[type] ?? type}
              value={`${data.count}x · ${formatNumber(data.volume, 1)} ${vehicle.fuelUnit}`}
              detail={formatCurrency(data.cost, vehicle.currency)}
            />
          ))}
        </FormSection>
      )}

      {topMaint.length > 0 && (
        <FormSection title="Manutenções mais caras">
          {topMaint.map((log) => (
            <MetricRow
              key={log.id}
              label={getMaintenanceLabel(log.maintenanceItemId, log.customTitle)}
              value={formatCurrency(log.cost!, vehicle.currency)}
              detail={formatDateDisplay(log.date)}
            />
          ))}
        </FormSection>
      )}

      {fuelLogs.length === 0 && maintLogs.length === 0 && (
        <EmptyState
          icon="bar-chart-outline"
          title="Sem dados ainda"
          subtitle="Registre abastecimentos e manutenções para gerar relatórios."
          accent={AccentColors.maintenance.solid}
        />
      )}
    </Screen>
  );
}

function StatTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.statTile, Shadows.card, { backgroundColor: theme.backgroundElement }]}>
      <ThemedText type="eyebrow" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="heading" style={[{ fontSize: 22, lineHeight: 26 }, color ? { color } : undefined]}>
        {value}
      </ThemedText>
    </View>
  );
}

function MetricRow({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail?: string;
  color?: string;
}) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricText}>
        <ThemedText type="smallBold">{label}</ThemedText>
        {detail ? (
          <ThemedText type="small" themeColor="textSecondary">
            {detail}
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="smallBold" style={[{ fontSize: 15 }, color ? { color } : undefined]}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  splitTrack: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: 'rgba(244, 239, 230, 0.08)',
  },
  splitFuel: {
    backgroundColor: '#F59E0B',
  },
  splitMaint: {
    backgroundColor: '#3B82F6',
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  heroMetaItem: {
    flex: 1,
    gap: 4,
  },
  heroMetaDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(244, 239, 230, 0.12)',
  },
  heroMetaLabel: {
    color: 'rgba(244, 239, 230, 0.45)',
  },
  heroMetaFuel: {
    color: '#F59E0B',
    fontSize: 15,
  },
  heroMetaMaint: {
    color: '#60A5FA',
    fontSize: 15,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  tileRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statTile: {
    flex: 1,
    gap: 6,
    padding: Spacing.three,
    borderRadius: Radius.lg,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricText: {
    flex: 1,
    gap: 2,
  },
  consumptionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -Spacing.one,
  },
  noteText: {
    fontSize: 12,
  },
  noteLink: {
    fontSize: 12,
    textDecorationLine: 'underline',
    color: '#3B82F6',
  },
});
