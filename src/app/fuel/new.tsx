import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { parseLocaleNumber } from '@/components/form-utils';
import { Chip, Field, PrimaryButton, TextField } from '@/components/forms';
import { NeedsVehicle } from '@/components/needs-vehicle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { displayToIso, formatNumber, getLastOdometer, todayDisplayDate } from '@/domain/stats';
import { FUEL_TYPE_LABELS, type FuelType } from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';

const FUEL_TYPES = Object.keys(FUEL_TYPE_LABELS) as FuelType[];

export default function NewFuelScreen() {
  const garage = useGarage();
  const router = useRouter();

  const lastOdo = getLastOdometer(garage);
  const [odometer, setOdometer] = useState('');
  const [volume, setVolume] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [fuelType, setFuelType] = useState<FuelType>('gasoline');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(todayDisplayDate());
  const [saving, setSaving] = useState(false);

  if (!garage.loading && !garage.vehicle) {
    return (
      <Screen>
        <NeedsVehicle />
      </Screen>
    );
  }

  async function onSave() {
    const odo = parseLocaleNumber(odometer);
    const vol = parseLocaleNumber(volume);
    const cost = parseLocaleNumber(totalCost);
    const isoDate = displayToIso(date);

    if (!isoDate) {
      Alert.alert('Atenção', 'Informe a data no formato dd/mm/aaaa.');
      return;
    }
    if (odo == null || odo < 0) {
      Alert.alert('Atenção', 'Informe um odômetro válido.');
      return;
    }
    if (vol == null || vol <= 0) {
      Alert.alert('Atenção', 'Informe o volume abastecido.');
      return;
    }
    if (cost == null || cost < 0) {
      Alert.alert('Atenção', 'Informe o valor total.');
      return;
    }

    setSaving(true);
    try {
      await garage.addFuelLog({
        date: isoDate,
        odometer: odo,
        volume: vol,
        totalCost: cost,
        isFullTank,
        fuelType,
        notes: notes.trim() || undefined,
      });
      router.back();
    } catch (error) {
      Alert.alert('Erro', error instanceof Error ? error.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Field label={`Odômetro (${garage.vehicle?.odometerUnit ?? 'km'})`}>
        <TextField
          value={odometer}
          onChangeText={setOdometer}
          keyboardType="decimal-pad"
          placeholder={lastOdo != null ? formatNumber(lastOdo) : '45200'}
        />
      </Field>

      <Field label="Tipo de combustível">
        <View style={styles.chips}>
          {FUEL_TYPES.map((type) => (
            <Chip
              key={type}
              label={FUEL_TYPE_LABELS[type]}
              selected={fuelType === type}
              onPress={() => setFuelType(type)}
            />
          ))}
        </View>
      </Field>

      <Field label={`Volume (${garage.vehicle?.fuelUnit ?? 'L'})`}>
        <TextField
          value={volume}
          onChangeText={setVolume}
          keyboardType="decimal-pad"
          placeholder="40,5"
        />
      </Field>
      <Field label="Valor total">
        <TextField
          value={totalCost}
          onChangeText={setTotalCost}
          keyboardType="decimal-pad"
          placeholder="250,00"
        />
      </Field>

      <Field label="Tanque cheio?">
        <View style={styles.chips}>
          <Chip label="Sim" selected={isFullTank} onPress={() => setIsFullTank(true)} />
          <Chip label="Não" selected={!isFullTank} onPress={() => setIsFullTank(false)} />
        </View>
      </Field>

      <Field label="Observações">
        <TextField
          value={notes}
          onChangeText={setNotes}
          placeholder="Posto, observações…"
          multiline
        />
      </Field>

      <Field label="Data (dd/mm/aaaa)">
        <TextField value={date} onChangeText={setDate} placeholder="11/09/2026" />
      </Field>

      <PrimaryButton label={saving ? 'Salvando…' : 'Salvar abastecimento'} onPress={onSave} disabled={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
