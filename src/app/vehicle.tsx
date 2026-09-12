import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { parseLocaleNumber, toInputNumber } from '@/components/form-utils';
import { Chip, Field, PrimaryButton, TextField } from '@/components/forms';
import { PressableScale } from '@/components/motion';
import { Cluster } from '@/components/cluster';
import { FormHero, FormSection } from '@/components/form-section';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { VehiclePhoto } from '@/components/vehicle-photo';
import { Chrome, Radius, Shadows, Spacing } from '@/constants/theme';
import { createId } from '@/domain/ids';
import { formatNumber, tireCorrectionFactor } from '@/domain/stats';
import { deleteVehiclePhoto, persistVehiclePhoto, pickVehiclePhoto } from '@/storage/vehicle-photo';
import {
  MAINTENANCE_GROUPS,
  MAINTENANCE_GROUP_LABELS,
  MAINTENANCE_ITEMS,
  type FuelUnit,
  type MaintenanceGroup,
  type MaintenanceScheduleEntry,
  type OdometerUnit,
  type TireCorrection,
  type Vehicle,
  getVehicleDisplayName,
} from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';
import { useTheme } from '@/hooks/use-theme';

export default function VehicleScreen() {
  const garage = useGarage();
  const theme = useTheme();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  if (garage.loading) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={theme.text} />
      </Screen>
    );
  }

  // If no vehicles, go straight to add form
  if (garage.vehicles.length === 0) {
    return <VehicleForm garage={garage} theme={theme} onDone={() => {}} />;
  }

  // If creating a new vehicle
  if (creatingNew) {
    return (
      <VehicleForm
        garage={garage}
        theme={theme}
        onDone={() => setCreatingNew(false)}
      />
    );
  }

  // If editing a vehicle
  if (editingId) {
    const v = garage.vehicles.find((v) => v.id === editingId);
    if (v) {
      return (
        <VehicleForm
          garage={garage}
          theme={theme}
          vehicle={v}
          onDone={() => setEditingId(null)}
        />
      );
    }
  }

  // List view
  return (
    <Screen>
      <Cluster
        eyebrow="Garagem"
        title={String(garage.vehicles.length)}
        subtitle={garage.vehicles.length === 1 ? 'veículo cadastrado' : 'veículos cadastrados'}
        accent="maintenance"
        size="display"
        imageUri={garage.vehicle?.photoUri}
      />

      <View style={styles.vehicleList}>
        {garage.vehicles.map((v) => {
          const isActive = v.id === garage.selectedVehicleId;
          const displayName = getVehicleDisplayName(v);
          const nameColor = isActive ? '#F4EFE6' : theme.text;
          return (
            <View
              key={v.id}
              style={[
                styles.vehicleCard,
                Shadows.card,
                { backgroundColor: isActive ? '#161410' : theme.backgroundElement },
              ]}>
              <PressableScale
                onPress={() => garage.selectVehicle(v.id)}
                style={styles.vehicleCardMain}>
                <VehiclePhoto
                  uri={v.photoUri}
                  size={48}
                  radius={14}
                  iconColor={isActive ? '#60A5FA' : theme.text}
                />
                <Text style={[styles.vehicleName, { color: nameColor }]} numberOfLines={1}>
                  {displayName}
                </Text>
                {isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Ativo</Text>
                  </View>
                )}
              </PressableScale>

              <View style={[styles.vehicleActions, { borderTopColor: isActive ? 'rgba(244, 239, 230, 0.12)' : theme.backgroundSelected }]}>
                <Pressable
                  onPress={() => setEditingId(v.id)}
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
                  <Text style={styles.editText}>Editar</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (garage.vehicles.length <= 1) {
                      Alert.alert('Atenção', 'Não é possível excluir o único veículo.');
                      return;
                    }
                    Alert.alert(
                      'Excluir veículo',
                      `Excluir "${displayName}" e todos os seus registros?`,
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Excluir',
                          style: 'destructive',
                          onPress: () => garage.deleteVehicle(v.id),
                        },
                      ]
                    );
                  }}
                  style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}>
                  <Text style={styles.deleteText}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <PrimaryButton
        label="Adicionar veículo"
        onPress={() => setCreatingNew(true)}
      />
    </Screen>
  );
}

// ──────────────────────────────────────────────
// Vehicle edit / create form
// ──────────────────────────────────────────────

type VehicleFormProps = {
  garage: ReturnType<typeof useGarage>;
  theme: ReturnType<typeof useTheme>;
  vehicle?: Vehicle;
  onDone: () => void;
};

function VehicleForm({ garage, theme, vehicle: existing, onDone }: VehicleFormProps) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [odometerUnit, setOdometerUnit] = useState<OdometerUnit>('km');
  const [fuelUnit, setFuelUnit] = useState<FuelUnit>('L');
  const [currency, setCurrency] = useState('BRL');
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Tire correction
  const [oldWidth, setOldWidth] = useState('');
  const [oldAspect, setOldAspect] = useState('');
  const [oldRim, setOldRim] = useState('');
  const [newWidth, setNewWidth] = useState('');
  const [newAspect, setNewAspect] = useState('');
  const [newRim, setNewRim] = useState('');
  const [showTireSection, setShowTireSection] = useState(false);
  const [tireExpanded, setTireExpanded] = useState(false);

  // Maintenance schedule
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleExpanded, setScheduleExpanded] = useState(false);
  const [scheduleExpandedGroup, setScheduleExpandedGroup] = useState<string | null>(null);
  const [scheduleEntries, setScheduleEntries] = useState<Record<string, { km: string; months: string }>>({});

  useEffect(() => {
    if (hydrated) return;
    if (existing) {
      setMake(existing.make ?? '');
      setModel(existing.model ?? '');
      setYear(existing.year != null ? String(existing.year) : '');
      setOdometerUnit(existing.odometerUnit);
      setFuelUnit(existing.fuelUnit);
      setCurrency(existing.currency);
      setPhotoUri(existing.photoUri);
      if (existing.tireCorrection) {
        const tc = existing.tireCorrection;
        setOldWidth(String(tc.oldWidth));
        setOldAspect(String(tc.oldAspect));
        setOldRim(String(tc.oldRim));
        setNewWidth(String(tc.newWidth));
        setNewAspect(String(tc.newAspect));
        setNewRim(String(tc.newRim));
        setShowTireSection(true);
      }
      if (existing.maintenanceSchedule && existing.maintenanceSchedule.length > 0) {
        setShowSchedule(true);
        const entries: Record<string, { km: string; months: string }> = {};
        for (const entry of existing.maintenanceSchedule) {
          entries[entry.maintenanceItemId] = {
            km: entry.intervalKm != null ? String(entry.intervalKm) : '',
            months: entry.intervalMonths != null ? String(entry.intervalMonths) : '',
          };
        }
        setScheduleEntries(entries);
      }
    }
    setHydrated(true);
  }, [existing, hydrated]);

  if (!hydrated) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={theme.text} />
      </Screen>
    );
  }

  function parseTireCorrection(): TireCorrection | undefined {
    if (!showTireSection) return undefined;
    const ow = parseLocaleNumber(oldWidth);
    const oa = parseLocaleNumber(oldAspect);
    const or_ = parseLocaleNumber(oldRim);
    const nw = parseLocaleNumber(newWidth);
    const na = parseLocaleNumber(newAspect);
    const nr = parseLocaleNumber(newRim);
    if (ow == null || oa == null || or_ == null || nw == null || na == null || nr == null) {
      return undefined;
    }
    return { oldWidth: ow, oldAspect: oa, oldRim: or_, newWidth: nw, newAspect: na, newRim: nr };
  }

  function parseMaintenanceSchedule(): MaintenanceScheduleEntry[] | undefined {
    if (!showSchedule) return undefined;
    const result: MaintenanceScheduleEntry[] = [];
    for (const [itemId, entry] of Object.entries(scheduleEntries)) {
      const kmRaw = entry.km?.trim() ?? '';
      const monthsRaw = entry.months?.trim() ?? '';
      const km = kmRaw ? parseLocaleNumber(kmRaw) : null;
      const months = monthsRaw ? parseLocaleNumber(monthsRaw) : null;
      if (km != null || months != null) {
        result.push({
          maintenanceItemId: itemId,
          intervalKm: km ?? undefined,
          intervalMonths: months != null ? Math.round(months) : undefined,
        });
      }
    }
    return result.length > 0 ? result : undefined;
  }

  const tireCorr = parseTireCorrection();
  const factor = tireCorrectionFactor(tireCorr);
  const correctionPercent = ((factor - 1) * 100).toFixed(2);
  const tireFilled = tireCorr != null;

  async function onSave() {
    const trimmedMake = make.trim();
    const trimmedModel = model.trim();
    if (!trimmedMake && !trimmedModel) {
      Alert.alert('Atenção', 'Informe pelo menos a marca ou o modelo do veículo.');
      return;
    }
    const parsedYear = year.trim() ? parseLocaleNumber(year) : null;
    if (year.trim() && (parsedYear == null || parsedYear < 1900 || parsedYear > 2100)) {
      Alert.alert('Atenção', 'Ano inválido.');
      return;
    }
    if (showTireSection && !tireCorr) {
      Alert.alert('Atenção', 'Preencha todas as medidas de pneu para a correção, ou desative a seção.');
      return;
    }

    setSaving(true);
    try {
      const id = existing?.id ?? createId('veh');
      let nextPhoto = photoUri;
      if (photoUri && photoUri !== existing?.photoUri) {
        nextPhoto = await persistVehiclePhoto(photoUri, id);
      }
      if (existing?.photoUri && existing.photoUri !== nextPhoto) {
        await deleteVehiclePhoto(existing.photoUri);
      }
      const vehicleData = {
        make: trimmedMake || undefined,
        model: trimmedModel || undefined,
        year: parsedYear != null ? Math.round(parsedYear) : undefined,
        odometerUnit,
        fuelUnit,
        currency: currency.trim() || 'BRL',
        tireCorrection: tireCorr,
        maintenanceSchedule: parseMaintenanceSchedule(),
        photoUri: nextPhoto,
      };
      if (existing?.id) {
        await garage.updateVehicle({ ...vehicleData, id });
      } else {
        await garage.addVehicle({ ...vehicleData, id });
      }
      Alert.alert('Pronto', 'Veículo salvo.');
      onDone();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o veículo.');
    } finally {
      setSaving(false);
    }
  }

  function updateScheduleEntry(itemId: string, field: 'km' | 'months', value: string) {
    setScheduleEntries((prev) => ({
      ...prev,
      [itemId]: {
        km: prev[itemId]?.km ?? '',
        months: prev[itemId]?.months ?? '',
        [field]: value,
      },
    }));
  }

  const isNew = !existing || (!existing.make && !existing.model);

  return (
    <Screen>
      {/* Back button when editing from list */}
      {garage.vehicles.length > 0 && (
        <PressableScale onPress={onDone} style={styles.backRow}>
          <AppIcon name="chevron-back" size={18} color="#3B82F6" />
          <ThemedText type="small" style={styles.backText}>Voltar</ThemedText>
        </PressableScale>
      )}

      <FormHero
        eyebrow={isNew ? 'Novo cadastro' : 'Editar'}
        title={isNew ? 'Novo veículo' : 'Editar veículo'}
        accent="maintenance"
        imageUri={photoUri}
        meta={
          existing
            ? [{ label: 'Veículo', value: getVehicleDisplayName(existing) }]
            : undefined
        }
      />
      <ThemedText themeColor="textSecondary">
        {isNew ? 'Cadastre os dados do seu veículo.' : 'Altere os dados do veículo.'}
      </ThemedText>

      <PressableScale
        onPress={async () => {
          const uri = await pickVehiclePhoto();
          if (uri) setPhotoUri(uri);
        }}
        style={[styles.photoCard, Shadows.card, { backgroundColor: theme.backgroundElement }]}>
        {photoUri ? (
          <VehiclePhoto uri={photoUri} size={0} radius={18} />
        ) : (
          <View style={styles.photoEmpty}>
            <AppIcon name="camera-outline" size={22} color="#60A5FA" />
            <ThemedText type="smallBold">Adicionar foto do veículo</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Galeria ou câmera
            </ThemedText>
          </View>
        )}
        {photoUri ? (
          <Pressable
            onPress={() => setPhotoUri(undefined)}
            style={styles.photoRemove}
            hitSlop={8}>
            <AppIcon name="close" size={14} color={Chrome.text} />
          </Pressable>
        ) : null}
      </PressableScale>

      <FormSection title="Identidade">
      <Field label="Marca">
        <TextField value={make} onChangeText={setMake} placeholder="Ex.: Honda" />
      </Field>
      <Field label="Modelo">
        <TextField value={model} onChangeText={setModel} placeholder="Ex.: Civic" />
      </Field>
      <Field label="Ano">
        <TextField value={year} onChangeText={setYear} placeholder="Ex.: 2018" keyboardType="number-pad" />
      </Field>
      </FormSection>

      <FormSection title="Unidades">
      <Field label="Unidade do odômetro">
        <View style={styles.chips}>
          <Chip label="km" selected={odometerUnit === 'km'} onPress={() => setOdometerUnit('km')} />
          <Chip label="mi" selected={odometerUnit === 'mi'} onPress={() => setOdometerUnit('mi')} />
        </View>
      </Field>

      <Field label="Unidade de combustível">
        <View style={styles.chips}>
          <Chip label="Litros (L)" selected={fuelUnit === 'L'} onPress={() => setFuelUnit('L')} />
          <Chip label="Galões (gal)" selected={fuelUnit === 'gal'} onPress={() => setFuelUnit('gal')} />
        </View>
      </Field>

      <Field label="Moeda">
        <TextField value={currency} onChangeText={setCurrency} placeholder="ex.: BRL" autoCapitalize="characters" />
      </Field>
      </FormSection>

      {/* ───── Tire correction section ───── */}
      <ThemedView type="backgroundElement" style={styles.collapsibleSection}>
        <Pressable
          onPress={() => setTireExpanded(!tireExpanded)}
          style={({ pressed }) => pressed && styles.pressed}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <ThemedText type="smallBold">Correção de odômetro (pneus)</ThemedText>
              <Chip
                label={showTireSection ? 'Ativo' : 'Desativado'}
                selected
                color={showTireSection ? '#16a34a' : '#dc2626'}
                onPress={() => {
                  setShowTireSection(!showTireSection);
                  if (!showTireSection) setTireExpanded(true);
                }}
              />
            </View>
            {tireFilled && showTireSection && (
              <ThemedText type="small" themeColor="textSecondary">
                Fator: {factor.toFixed(4)} ({Number(correctionPercent) >= 0 ? '+' : ''}{correctionPercent}%)
              </ThemedText>
            )}
            <AppIcon
              name={tireExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={theme.textSecondary}
            />
          </View>
        </Pressable>

        {tireExpanded && (
          <View style={styles.sectionBody}>
            <ThemedText type="small" themeColor="textSecondary">
              Se o diâmetro da roda original foi alterado, informe as medidas antigas e novas.
              O consumo será corrigido automaticamente.
            </ThemedText>

            {showTireSection && (
              <View style={styles.tireFields}>
                <ThemedText type="smallBold">Pneu original</ThemedText>
                <View style={styles.tireRow}>
                  <View style={styles.tireField}>
                    <ThemedText type="small" themeColor="textSecondary">Largura (mm)</ThemedText>
                    <TextField value={oldWidth} onChangeText={setOldWidth} keyboardType="decimal-pad" placeholder="ex.: 195" style={styles.smallInput} />
                  </View>
                  <View style={styles.tireField}>
                    <ThemedText type="small" themeColor="textSecondary">Perfil (%)</ThemedText>
                    <TextField value={oldAspect} onChangeText={setOldAspect} keyboardType="decimal-pad" placeholder="ex.: 65" style={styles.smallInput} />
                  </View>
                  <View style={styles.tireField}>
                    <ThemedText type="small" themeColor="textSecondary">Aro (pol.)</ThemedText>
                    <TextField value={oldRim} onChangeText={setOldRim} keyboardType="decimal-pad" placeholder="ex.: 15" style={styles.smallInput} />
                  </View>
                </View>

                <ThemedText type="smallBold">Pneu atual</ThemedText>
                <View style={styles.tireRow}>
                  <View style={styles.tireField}>
                    <ThemedText type="small" themeColor="textSecondary">Largura (mm)</ThemedText>
                    <TextField value={newWidth} onChangeText={setNewWidth} keyboardType="decimal-pad" placeholder="ex.: 205" style={styles.smallInput} />
                  </View>
                  <View style={styles.tireField}>
                    <ThemedText type="small" themeColor="textSecondary">Perfil (%)</ThemedText>
                    <TextField value={newAspect} onChangeText={setNewAspect} keyboardType="decimal-pad" placeholder="ex.: 55" style={styles.smallInput} />
                  </View>
                  <View style={styles.tireField}>
                    <ThemedText type="small" themeColor="textSecondary">Aro (pol.)</ThemedText>
                    <TextField value={newRim} onChangeText={setNewRim} keyboardType="decimal-pad" placeholder="ex.: 16" style={styles.smallInput} />
                  </View>
                </View>

                {tireCorr && (
                  <ThemedView type="backgroundSelected" style={styles.correctionResult}>
                    <ThemedText type="small">
                      Fator de correção: <ThemedText type="smallBold">{factor.toFixed(4)}</ThemedText>
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      O odômetro marca {Number(correctionPercent) >= 0 ? '+' : ''}{correctionPercent}%
                      em relação à distância real.
                    </ThemedText>
                  </ThemedView>
                )}
              </View>
            )}
          </View>
        )}
      </ThemedView>

      {/* ───── Maintenance schedule section ───── */}
      <ThemedView type="backgroundElement" style={styles.collapsibleSection}>
        <Pressable
          onPress={() => setScheduleExpanded(!scheduleExpanded)}
          style={({ pressed }) => pressed && styles.pressed}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <ThemedText type="smallBold">Plano de manutenção</ThemedText>
              <Chip
                label={showSchedule ? 'Ativo' : 'Desativado'}
                selected
                color={showSchedule ? '#16a34a' : '#dc2626'}
                onPress={() => {
                  setShowSchedule(!showSchedule);
                  if (!showSchedule) setScheduleExpanded(true);
                }}
              />
            </View>
            {showSchedule && (
              <ThemedText type="small" themeColor="textSecondary">
                {Object.values(scheduleEntries).filter((e) => e.km?.trim() || e.months?.trim()).length} itens configurados
              </ThemedText>
            )}
            <AppIcon
              name={scheduleExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={theme.textSecondary}
            />
          </View>
        </Pressable>

        {scheduleExpanded && showSchedule && (
          <View style={styles.sectionBody}>
            <ThemedText type="small" themeColor="textSecondary">
              Preencha a quilometragem e/ou o tempo entre manutenções segundo o manual do seu carro.
              Esses intervalos serão usados para auto-preencher "próxima manutenção".
            </ThemedText>

            {MAINTENANCE_GROUPS.filter((g) => g !== 'other').map((group) => {
              const items = MAINTENANCE_ITEMS.filter((item) => item.group === group);
              if (items.length === 0) return null;
              const isExpanded = scheduleExpandedGroup === group;
              const filledCount = items.filter((item) => {
                const e = scheduleEntries[item.id];
                return e && (e.km?.trim() || e.months?.trim());
              }).length;

              return (
                <ScheduleGroup
                  key={group}
                  label={MAINTENANCE_GROUP_LABELS[group]}
                  isExpanded={isExpanded}
                  filledCount={filledCount}
                  onToggle={() => setScheduleExpandedGroup(isExpanded ? null : group)}
                  items={items.map((item) => ({
                    id: item.id,
                    label: item.label,
                    entry: scheduleEntries[item.id] ?? { km: '', months: '' },
                  }))}
                  onUpdate={updateScheduleEntry}
                />
              );
            })}

            {/* Custom "Outro" items from maintenance logs */}
            {(() => {
              const customTitles = [
                ...new Set(
                  garage.maintenanceLogs
                    .filter((l) => l.maintenanceItemId === 'other' && l.customTitle)
                    .map((l) => l.customTitle!)
                ),
              ];
              if (customTitles.length === 0) return null;
              const groupKey = '_custom' as MaintenanceGroup;
              const isExpanded = scheduleExpandedGroup === groupKey;
              const filledCount = customTitles.filter((t) => {
                const e = scheduleEntries[`other:${t}`];
                return e && (e.km?.trim() || e.months?.trim());
              }).length;
              return (
                <ScheduleGroup
                  label="Outros (personalizados)"
                  isExpanded={isExpanded}
                  filledCount={filledCount}
                  onToggle={() => setScheduleExpandedGroup(isExpanded ? null : groupKey)}
                  items={customTitles.map((title) => ({
                    id: `other:${title}`,
                    label: title,
                    entry: scheduleEntries[`other:${title}`] ?? { km: '', months: '' },
                  }))}
                  onUpdate={updateScheduleEntry}
                />
              );
            })()}
          </View>
        )}
      </ThemedView>

      <PrimaryButton
        label={saving ? 'Salvando…' : isNew ? 'Cadastrar veículo' : 'Salvar alterações'}
        onPress={onSave}
        disabled={saving}
      />
    </Screen>
  );
}

// ──────────────────────────────────────────────
// Schedule group component
// ──────────────────────────────────────────────

type ScheduleGroupProps = {
  label: string;
  isExpanded: boolean;
  filledCount: number;
  onToggle: () => void;
  items: { id: string; label: string; entry: { km: string; months: string } }[];
  onUpdate: (itemId: string, field: 'km' | 'months', value: string) => void;
};

function ScheduleGroup({ label, isExpanded, filledCount, onToggle, items, onUpdate }: ScheduleGroupProps) {
  return (
    <View>
      <Pressable onPress={onToggle} style={({ pressed }) => pressed && styles.pressed}>
        <View style={styles.scheduleGroupHeader}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            {label}
          </ThemedText>
          <View style={styles.scheduleGroupRight}>
            {filledCount > 0 && (
              <ThemedText type="small" style={styles.filledBadge}>
                {filledCount}
              </ThemedText>
            )}
            <AppIcon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color="#B4AFA4"
            />
          </View>
        </View>
      </Pressable>

      {isExpanded && items.map((item) => (
        <View key={item.id} style={styles.scheduleItem}>
          <ThemedText type="small">{item.label}</ThemedText>
          <View style={styles.scheduleInputRow}>
            <View style={styles.scheduleInputField}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.scheduleInputLabel}>
                A cada (km)
              </ThemedText>
              <TextField
                value={item.entry.km}
                onChangeText={(v) => onUpdate(item.id, 'km', v)}
                keyboardType="number-pad"
                placeholder="ex.: 10000"
                style={styles.smallInput}
              />
            </View>
            <View style={styles.scheduleInputField}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.scheduleInputLabel}>
                A cada (meses)
              </ThemedText>
              <TextField
                value={item.entry.months}
                onChangeText={(v) => onUpdate(item.id, 'months', v)}
                keyboardType="number-pad"
                placeholder="ex.: 12"
                style={styles.smallInput}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  photoCard: {
    height: 168,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  photoEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoRemove: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(12, 10, 8, 0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleList: {
    gap: Spacing.two,
  },
  vehicleCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  vehicleCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
  },
  vehicleActions: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center' as const,
    paddingVertical: 12,
  },
  editText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 14,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  collapsibleSection: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chevron: {
    textAlign: 'center',
    opacity: 0.4,
    fontSize: 10,
  },
  sectionBody: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  tireFields: {
    gap: Spacing.three,
  },
  tireRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  tireField: {
    flex: 1,
    gap: Spacing.half,
  },
  smallInput: {
    fontSize: 14,
    paddingVertical: Spacing.one,
  },
  correctionResult: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    gap: Spacing.half,
  },
  pressed: {
    opacity: 0.7,
  },
  scheduleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  scheduleGroupRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  filledBadge: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  scheduleItem: {
    gap: Spacing.one,
    paddingLeft: 12,
    paddingVertical: 8,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(59, 130, 246, 0.2)',
    marginLeft: 4,
  },
  scheduleInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  scheduleInputField: {
    flex: 1,
    gap: 2,
  },
  scheduleInputLabel: {
    fontSize: 11,
  },
});
