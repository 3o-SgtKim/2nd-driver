import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { PressableScale } from '@/components/motion';
import { ThemedText } from '@/components/themed-text';
import { VehiclePhoto } from '@/components/vehicle-photo';
import { Chrome, Radius, Shadows, Spacing } from '@/constants/theme';
import { getVehicleDisplayName } from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';

export function VehicleSelector() {
  const garage = useGarage();
  const [open, setOpen] = useState(false);

  if (garage.loading || garage.vehicles.length === 0) return null;

  const current = garage.vehicle;
  const hasMultiple = garage.vehicles.length > 1;

  async function handleSelect(id: string) {
    setOpen(false);
    await garage.selectVehicle(id);
  }

  return (
    <>
      <Pressable
        onPress={() => hasMultiple && setOpen(true)}
        style={({ pressed }) => [styles.trigger, hasMultiple && pressed && styles.pressed]}>
        <VehiclePhoto uri={current?.photoUri} size={22} radius={8} iconColor={Chrome.text} />
        <ThemedText type="smallBold" style={styles.triggerText} numberOfLines={1}>
          {current ? getVehicleDisplayName(current) : 'Selecionar'}
        </ThemedText>
        {hasMultiple && <AppIcon name="chevron-down" size={14} color={Chrome.muted} />}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.dropdownAnchor}>
            <View style={[styles.dropdown, Shadows.raised]}>
              {garage.vehicles.map((v) => {
                const isActive = v.id === garage.selectedVehicleId;
                return (
                  <PressableScale
                    key={v.id}
                    onPress={() => handleSelect(v.id)}
                    style={[styles.row, isActive && styles.rowActive]}>
                    <VehiclePhoto uri={v.photoUri} size={28} radius={8} iconColor={Chrome.text} />
                    <ThemedText
                      type={isActive ? 'smallBold' : 'small'}
                      numberOfLines={1}
                      style={[styles.rowName, { color: Chrome.text }]}>
                      {getVehicleDisplayName(v)}
                    </ThemedText>
                    {isActive && <AppIcon name="checkmark" size={18} color="#60A5FA" />}
                  </PressableScale>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    backgroundColor: Chrome.surface,
  },
  triggerText: {
    fontSize: 15,
    maxWidth: 220,
    color: Chrome.text,
  },
  pressed: {
    opacity: 0.75,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
  },
  dropdownAnchor: {
    width: '80%',
    maxWidth: 320,
  },
  dropdown: {
    borderRadius: Radius.lg,
    backgroundColor: Chrome.surface,
    padding: Spacing.one,
    borderWidth: 1,
    borderColor: Chrome.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: Radius.md,
    gap: 10,
  },
  rowActive: {
    backgroundColor: 'rgba(96, 165, 250, 0.16)',
  },
  rowName: {
    fontSize: 15,
    flex: 1,
  },
});
