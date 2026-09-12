import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { AccentColors, Chrome, MaxContentWidth, Spacing } from '@/constants/theme';

type SymbolName = SymbolViewProps['name'];

type TabConfig = {
  name: string;
  label: string;
  symbol: SymbolName;
  accentColor?: string;
};

const TABS: TabConfig[] = [
  {
    name: 'home',
    label: 'Início',
    symbol: { ios: 'house.fill', android: 'home', web: 'home' } as SymbolName,
  },
  {
    name: 'fuel',
    label: 'Combustível',
    symbol: { ios: 'fuelpump.fill', android: 'local_gas_station', web: 'local_gas_station' } as SymbolName,
    accentColor: AccentColors.fuel.solid,
  },
  {
    name: 'maintenance',
    label: 'Manutenção',
    symbol: { ios: 'wrench.adjustable.fill', android: 'build', web: 'build' } as SymbolName,
    accentColor: AccentColors.maintenance.solid,
  },
  {
    name: 'reports',
    label: 'Relatórios',
    symbol: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' } as SymbolName,
  },
  {
    name: 'vehicle',
    label: 'Garagem',
    symbol: { ios: 'car.fill', android: 'directions_car', web: 'directions_car' } as SymbolName,
  },
];

const TAB_HREFS = {
  home: '/',
  fuel: '/fuel',
  maintenance: '/maintenance',
  reports: '/reports',
  vehicle: '/vehicle',
} as const;

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger
              key={tab.name}
              name={tab.name}
              href={TAB_HREFS[tab.name as keyof typeof TAB_HREFS] as any}
              asChild>
              <TabButton tab={tab} />
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

type TabButtonProps = TabTriggerSlotProps & { tab: TabConfig };

export function TabButton({ children, isFocused, tab, ...props }: TabButtonProps) {
  const tintColor =
    isFocused && tab.accentColor
      ? tab.accentColor
      : isFocused
        ? '#F59E0B'
        : Chrome.muted;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <SymbolView tintColor={tintColor} name={tab.symbol} size={18} />
      <ThemedText type="small" style={[styles.tabLabel, { color: tintColor }]}>
        {tab.label}
      </ThemedText>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <ThemedView type="chrome" style={styles.innerContainer}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexGrow: 1,
    maxWidth: MaxContentWidth,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.one,
    minWidth: 52,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
