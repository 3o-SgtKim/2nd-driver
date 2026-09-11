import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { parseLocaleNumber, toInputNumber } from '@/components/form-utils';
import { Chip, Field, PrimaryButton, TextField } from '@/components/forms';
import { MaintenanceCategoryPicker } from '@/components/maintenance-category-picker';
import { NeedsVehicle } from '@/components/needs-vehicle';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { computeNextDue, displayToIso, formatNumber, getLastOdometer, isoToDisplay, todayDisplayDate, todayIsoDate } from '@/domain/stats';
import { useGarage } from '@/hooks/use-garage';

export default function NewMaintenanceScreen() {
  const garage = useGarage();
  const router = useRouter();

  const lastOdo = getLastOdometer(garage);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [nextDueOdometer, setNextDueOdometer] = useState('');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(todayDisplayDate());
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!garage.loading && !garage.vehicle) {
    return (
      <Screen>
        <NeedsVehicle />
      </Screen>
    );
  }

  const isOther = selectedItemId === 'other';

  async function onSave() {
    if (!selectedItemId) {
      Alert.alert('Atenção', 'Escolha o tipo de manutenção.');
      return;
    }
    if (isOther && !customTitle.trim()) {
      Alert.alert('Atenção', 'Informe o título do serviço.');
      return;
    }

    const odo = parseLocaleNumber(odometer);
    const parsedCost = cost.trim() ? parseLocaleNumber(cost) : null;
    const parsedNextOdo = nextDueOdometer.trim()
      ? parseLocaleNumber(nextDueOdometer)
      : null;
    const isoDate = displayToIso(date);
    const isoNextDue = nextDueDate.trim() ? displayToIso(nextDueDate) : null;

    if (!isoDate) {
      Alert.alert('Atenção', 'Informe a data no formato dd/mm/aaaa.');
      return;
    }
    if (odo == null || odo < 0) {
      Alert.alert('Atenção', 'Informe um odômetro válido.');
      return;
    }
    if (cost.trim() && parsedCost == null) {
      Alert.alert('Atenção', 'Custo inválido.');
      return;
    }
    if (nextDueOdometer.trim() && parsedNextOdo == null) {
      Alert.alert('Atenção', 'Próximo odômetro inválido.');
      return;
    }
    if (nextDueDate.trim() && !isoNextDue) {
      Alert.alert('Atenção', 'Próxima data no formato dd/mm/aaaa.');
      return;
    }

    setSaving(true);
    try {
      await garage.addMaintenanceLog({
        maintenanceItemId: selectedItemId,
        customTitle: isOther ? customTitle.trim() : undefined,
        date: isoDate,
        odometer: odo,
        cost: parsedCost ?? undefined,
        nextDueOdometer: parsedNextOdo ?? undefined,
        nextDueDate: isoNextDue ?? undefined,
        notes: notes.trim() || undefined,
        reminderEnabled,
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
      <MaintenanceCategoryPicker
        selectedItemId={selectedItemId}
        onSelect={setSelectedItemId}
      />

      {isOther && (
        <Field label="Título do serviço">
          <TextField
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="Descreva o serviço…"
          />
        </Field>
      )}

      {selectedItemId && (
        <>
          <Field label={`Odômetro (${garage.vehicle?.odometerUnit ?? 'km'})`}>
            <TextField
              value={odometer}
              onChangeText={setOdometer}
              keyboardType="decimal-pad"
              placeholder={lastOdo != null ? formatNumber(lastOdo) : '45200'}
            />
          </Field>
          <Field label="Custo (opcional)">
            <TextField
              value={cost}
              onChangeText={setCost}
              keyboardType="decimal-pad"
              placeholder="350,00"
            />
          </Field>
          <Field label="Próximo odômetro (opcional)">
            <TextField
              value={nextDueOdometer}
              onChangeText={setNextDueOdometer}
              keyboardType="decimal-pad"
              placeholder="50200"
            />
          </Field>
          <Field label="Próxima data (opcional, dd/mm/aaaa)">
            <View style={styles.fieldWithAutoFill}>
              <View style={styles.fieldInputFlex}>
                <TextField
                  value={nextDueDate}
                  onChangeText={setNextDueDate}
                  placeholder="20/09/2026"
                />
              </View>
              {(() => {
                const schedule = garage.vehicle?.maintenanceSchedule;
                const scheduleKey = isOther && customTitle.trim()
                  ? `other:${customTitle.trim()}`
                  : selectedItemId;
                const entry = schedule?.find((e) => e.maintenanceItemId === scheduleKey);
                if (!entry) return null;
                return (
                  <Pressable
                    onPress={() => {
                      const odo = parseLocaleNumber(odometer);
                      const dateIso = displayToIso(date) ?? todayIsoDate();
                      const next = computeNextDue(odo ?? 0, dateIso, entry.intervalKm, entry.intervalMonths);
                      if (next.nextOdometer != null) setNextDueOdometer(toInputNumber(next.nextOdometer));
                      if (next.nextDateIso) setNextDueDate(isoToDisplay(next.nextDateIso));
                    }}
                    style={({ pressed }) => [styles.autoFillBtn, pressed && styles.pressed]}>
                    <ThemedText type="small" style={styles.autoFillLabel}>⚡ Plano</ThemedText>
                  </Pressable>
                );
              })()}
            </View>
          </Field>

          {(nextDueOdometer.trim() || nextDueDate.trim()) && (
            <Field label="Lembrete">
              <View style={styles.chips}>
                <Chip
                  label={reminderEnabled ? 'Notificação ativa' : 'Notificação desativada'}
                  selected
                  color={reminderEnabled ? '#16a34a' : '#dc2626'}
                  onPress={() => setReminderEnabled(!reminderEnabled)}
                />
              </View>
              {reminderEnabled && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.reminderHint}>
                  Você será notificado quando a data chegar ou no primeiro abastecimento que ultrapasse o odômetro definido.
                </ThemedText>
              )}
            </Field>
          )}

          <Field label="Observações">
            <TextField value={notes} onChangeText={setNotes} multiline placeholder="Oficina, peças…" />
          </Field>

          <Field label="Data (dd/mm/aaaa)">
            <TextField value={date} onChangeText={setDate} placeholder="11/09/2026" />
          </Field>

          <PrimaryButton
            label={saving ? 'Salvando…' : 'Salvar manutenção'}
            onPress={onSave}
            disabled={saving}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  reminderHint: {
    marginTop: 4,
  },
  fieldWithAutoFill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  fieldInputFlex: {
    flex: 1,
  },
  autoFillBtn: {
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  autoFillLabel: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.7,
  },
});
