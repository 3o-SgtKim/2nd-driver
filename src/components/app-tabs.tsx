import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Chrome } from '@/constants/theme';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Chrome.surface}
      indicatorColor="#2A2418"
      labelStyle={{
        default: { color: Chrome.faint },
        selected: { color: '#F59E0B' },
      }}
      tintColor="#F59E0B"
      iconColor={{ default: Chrome.muted, selected: '#F59E0B' }}
      labelVisibilityMode="labeled">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="fuel">
        <NativeTabs.Trigger.Label>Combustível</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'fuelpump', selected: 'fuelpump.fill' }}
          md="local_gas_station"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="maintenance">
        <NativeTabs.Trigger.Label>Manutenção</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'wrench.adjustable', selected: 'wrench.adjustable.fill' }}
          md="build"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reports">
        <NativeTabs.Trigger.Label>Relatórios</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          md="bar_chart"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="vehicle">
        <NativeTabs.Trigger.Label>Garagem</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'car', selected: 'car.fill' }}
          md="directions_car"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
