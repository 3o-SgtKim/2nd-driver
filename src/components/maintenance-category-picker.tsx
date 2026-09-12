import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { AccentColors, Spacing } from '@/constants/theme';
import {
  MAINTENANCE_GROUP_LABELS,
  MAINTENANCE_GROUPS,
  MAINTENANCE_ITEMS,
  type MaintenanceGroup,
} from '@/domain/types';

type Props = {
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
};

const accentBlue = AccentColors.maintenance;

export function MaintenanceCategoryPicker({ selectedItemId, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<MaintenanceGroup | null>(null);

  const selectedItem = selectedItemId
    ? MAINTENANCE_ITEMS.find((i) => i.id === selectedItemId)
    : null;

  function toggleGroup(group: MaintenanceGroup) {
    setExpandedGroup((prev) => (prev === group ? null : group));
  }

  function handleSelect(itemId: string) {
    onSelect(itemId);
    setExpandedGroup(null);
    setOpen(false);
  }

  return (
    <View style={styles.container}>
      {/* Top-level dropdown trigger */}
      <Pressable onPress={() => setOpen(!open)} style={({ pressed }) => pressed && styles.pressed}>
        <View style={[styles.dropdownTrigger, open && styles.dropdownTriggerOpen]}>
          <View style={styles.triggerContent}>
            <ThemedText type="smallBold" style={styles.triggerLabel}>
              Tipo de manutenção
            </ThemedText>
            {selectedItem && (
              <ThemedText type="small" style={styles.triggerValue}>
                {selectedItem.label}
              </ThemedText>
            )}
            {!selectedItem && (
              <ThemedText type="small" themeColor="textSecondary">
                Selecione…
              </ThemedText>
            )}
          </View>
          <AppIcon
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={accentBlue.solid}
          />
        </View>
      </Pressable>

      {/* Expanded panel */}
      {open && (
        <View style={styles.panel}>
          {MAINTENANCE_GROUPS.map((group) => {
            const items = MAINTENANCE_ITEMS.filter((item) => item.group === group);
            if (items.length === 0) return null;
            const isExpanded = expandedGroup === group;
            const hasSelection = items.some((item) => item.id === selectedItemId);

            if (group === 'other') {
              const otherItem = items[0];
              const isSelected = selectedItemId === otherItem.id;
              return (
                <Pressable
                  key={group}
                  onPress={() => handleSelect(otherItem.id)}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <View style={[styles.groupHeader, isSelected && styles.groupHeaderSelected]}>
                    <ThemedText
                      type="smallBold"
                      style={isSelected ? styles.groupLabelSelected : styles.groupLabel}>
                      Outro
                    </ThemedText>
                  </View>
                </Pressable>
              );
            }

            return (
              <View key={group}>
                <Pressable
                  onPress={() => toggleGroup(group)}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <View style={[styles.groupHeader, hasSelection && styles.groupHeaderActive]}>
                    <ThemedText
                      type="smallBold"
                      style={hasSelection ? styles.groupLabelActive : styles.groupLabel}>
                      {MAINTENANCE_GROUP_LABELS[group]}
                    </ThemedText>
                    <AppIcon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color={accentBlue.solid}
                    />
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.itemList}>
                    {items.map((item) => {
                      const isSelected = selectedItemId === item.id;
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => handleSelect(item.id)}
                          style={({ pressed }) => pressed && styles.pressed}>
                          <View
                            style={[
                              styles.itemRow,
                              isSelected && styles.itemRowSelected,
                            ]}>
                            <ThemedText
                              type="small"
                              style={isSelected ? styles.itemTextSelected : undefined}
                              themeColor={isSelected ? undefined : 'textSecondary'}>
                              {item.label}
                            </ThemedText>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  dropdownTriggerOpen: {
    borderColor: accentBlue.solid,
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
  },
  triggerContent: {
    flex: 1,
    gap: 2,
  },
  triggerLabel: {
    color: accentBlue.solid,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  triggerValue: {
    color: accentBlue.solid,
    fontWeight: '600',
  },
  chevronMain: {
    color: accentBlue.solid,
    fontSize: 12,
    marginLeft: Spacing.two,
  },
  panel: {
    gap: Spacing.one,
    paddingLeft: 4,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.10)',
  },
  groupHeaderActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: accentBlue.solid,
  },
  groupHeaderSelected: {
    backgroundColor: accentBlue.solid,
    borderColor: accentBlue.solid,
  },
  groupLabel: {
    color: accentBlue.solid,
    fontSize: 13,
  },
  groupLabelActive: {
    color: accentBlue.solid,
    fontSize: 13,
  },
  groupLabelSelected: {
    color: '#ffffff',
    fontSize: 13,
  },
  chevron: {
    color: accentBlue.solid,
    fontSize: 10,
  },
  itemList: {
    marginLeft: 12,
    marginTop: 2,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(59, 130, 246, 0.2)',
    paddingLeft: 10,
    gap: 2,
  },
  itemRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  itemRowSelected: {
    backgroundColor: accentBlue.solid,
  },
  itemTextSelected: {
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.75,
  },
});
