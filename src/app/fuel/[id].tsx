import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { parseLocaleNumber, toInputNumber } from '@/components/form-utils';
import { FormHero, FormSection } from '@/components/form-section';
import { Chip, Field, PrimaryButton, TextField } from '@/components/forms';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { displayToIso, isoToDisplay } from '@/domain/stats';
import { FUEL_TYPE_LABELS, type FuelType } from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';

const FUEL_TYPES = Object.keys(FUEL_TYPE_LABELS) as FuelType[];

export default function EditFuelScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const garage = useGarage();
  const router = useRouter();
  const log = garage.fuelLogs.find((item) => item.id === id);

  const [odometer, setOdometer] = useState('');
  const [volume, setVolume] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [isFullTank, setIsFullTank] = useState(true);
  const [fuelType, setFuelType] = useState<FuelType>('gasoline');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!log || ready) {
      return;
    }
    setOdometer(toInputNumber(log.odometer));
    setVolume(toInputNumber(log.volume, 2));
    setTotalCost(toInputNumber(log.totalCost, 2));
    setIsFullTank(log.isFullTank);
    setFuelType(log.fuelType ?? 'gasoline');
    setNotes(log.notes ?? '');
    setDate(isoToDisplay(log.date));
    setReady(true);
  }, [log, ready]);

  if (!garage.loading && !log) {
    return (
      <Screen>
        <ThemedText>Abastecimento não encontrado.</ThemedText>
        <PrimaryButton label="Voltar" onPress={() => router.back()} />
      </Screen>
    );
  }

  async function onSave() {
    if (!log) {
      return;
    }
    const odo = parseLocaleNumber(odometer);
    const vol = parseLocaleNumber(volume);
    const cost = parseLocaleNumber(totalCost);
    const isoDate = displayToIso(date);

    if (!isoDate || odo == null || vol == null || cost == null) {
      Alert.alert('Atenção', 'Preencha data (dd/mm/aaaa), odômetro, volume e valor.');
      return;
    }

    setSaving(true);
    try {
      await garage.updateFuelLog({
        id: log.id,
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

  function onDelete() {
    if (!log) {
      return;
    }
    Alert.alert('Excluir abastecimento', 'Tem certeza que deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await garage.deleteFuelLog(log.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen>
      <FormHero
        eyebrow="Editar registro"
        title="Abastecimento"
        accent="fuel"
        imageUri={garage.vehicle?.photoUri}
        outlined
        meta={
          log
            ? [{ label: 'Registrado em', value: isoToDisplay(log.date) }]
            : undefined
        }
      />

      <FormSection title="Leitura">
        <Field label={`Odômetro (${garage.vehicle?.odometerUnit ?? 'km'})`}>
          <TextField value={odometer} onChangeText={setOdometer} keyboardType="decimal-pad" />
        </Field>
      </FormSection>

      <FormSection title="Abastecimento">
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
          <TextField value={volume} onChangeText={setVolume} keyboardType="decimal-pad" />
        </Field>
        <Field label="Valor total">
          <TextField value={totalCost} onChangeText={setTotalCost} keyboardType="decimal-pad" />
        </Field>
        <Field label="Tanque cheio?">
          <View style={styles.chips}>
            <Chip label="Sim" selected={isFullTank} onPress={() => setIsFullTank(true)} />
            <Chip label="Não" selected={!isFullTank} onPress={() => setIsFullTank(false)} />
          </View>
        </Field>
      </FormSection>

      <FormSection title="Detalhes">
        <Field label="Observações">
          <TextField value={notes} onChangeText={setNotes} multiline />
        </Field>
        <Field label="Data (dd/mm/aaaa)">
          <TextField value={date} onChangeText={setDate} />
        </Field>
      </FormSection>

      <PrimaryButton label={saving ? 'Salvando…' : 'Salvar'} onPress={onSave} disabled={saving} />
      <PrimaryButton label="Excluir" onPress={onDelete} tone="danger" />
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
