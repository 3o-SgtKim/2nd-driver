import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getVehicleDisplayName } from '@/domain/types';
import { useGarage } from '@/hooks/use-garage';
import { useTheme } from '@/hooks/use-theme';

/**
 * Centered vehicle switcher.
 * Shows current vehicle name + ▼. Tapping opens a list to switch vehicles.
 */
export function VehicleSelector() {
  const garage = useGarage();
  const theme = useTheme();
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
        <ThemedText type="smallBold" style={styles.triggerText} numberOfLines={1}>
          {current ? getVehicleDisplayName(current) : 'Selecionar'}
        </ThemedText>
        {hasMultiple && (
          <ThemedText style={[styles.arrow, { color: theme.textSecondary }]}>▼</ThemedText>
        )}
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.dropdownAnchor}>
            <ThemedView
              type="backgroundElement"
              style={[styles.dropdown, { borderColor: theme.backgroundSelected }]}>
              {garage.vehicles.map((v) => {
                const isActive = v.id === garage.selectedVehicleId;
                return (
                  <Pressable
                    key={v.id}
                    onPress={() => handleSelect(v.id)}
                    style={({ pressed }) => [
                      styles.row,
                      isActive && styles.rowActive,
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText
                      type={isActive ? 'smallBold' : 'small'}
                      numberOfLines={1}
                      style={styles.rowName}>
                      {getVehicleDisplayName(v)}
                    </ThemedText>
                    {isActive && (
                      <ThemedText style={styles.check}>✓</ThemedText>
                    )}
                  </Pressable>
                );
              })}
            </ThemedView>
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
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  triggerText: {
    fontSize: 15,
    maxWidth: 240,
  },
  arrow: {
    fontSize: 10,
  },
  pressed: {
    opacity: 0.6,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 120,
  },
  dropdownAnchor: {
    width: '80%',
    maxWidth: 320,
  },
  dropdown: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.one,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  rowActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
  },
  rowName: {
    fontSize: 15,
    flex: 1,
  },
  check: {
    fontSize: 16,
    color: '#3B82F6',
    marginLeft: 8,
  },
});
