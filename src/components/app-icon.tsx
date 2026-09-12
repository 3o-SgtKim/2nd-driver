import { SymbolView, type SymbolViewProps } from 'expo-symbols';

export type AppIconName =
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-back'
  | 'close'
  | 'checkmark'
  | 'add'
  | 'flash'
  | 'speedometer-outline'
  | 'car-outline'
  | 'car-sport-outline'
  | 'construct-outline'
  | 'water-outline'
  | 'bar-chart-outline'
  | 'camera-outline';

const ICONS: Record<AppIconName, SymbolViewProps['name']> = {
  'chevron-down': { ios: 'chevron.down', android: 'keyboard_arrow_down', web: 'keyboard_arrow_down' },
  'chevron-up': { ios: 'chevron.up', android: 'keyboard_arrow_up', web: 'keyboard_arrow_up' },
  'chevron-back': { ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  checkmark: { ios: 'checkmark', android: 'check', web: 'check' },
  add: { ios: 'plus', android: 'add', web: 'add' },
  flash: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
  'speedometer-outline': { ios: 'speedometer', android: 'speed', web: 'speed' },
  'car-outline': { ios: 'car', android: 'directions_car', web: 'directions_car' },
  'car-sport-outline': { ios: 'car.fill', android: 'directions_car', web: 'directions_car' },
  'construct-outline': { ios: 'wrench.adjustable', android: 'build', web: 'build' },
  'water-outline': { ios: 'drop', android: 'water_drop', web: 'water_drop' },
  'bar-chart-outline': { ios: 'chart.bar', android: 'bar_chart', web: 'bar_chart' },
  'camera-outline': { ios: 'camera', android: 'photo_camera', web: 'photo_camera' },
};

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color: string;
};

export function AppIcon({ name, size = 18, color }: AppIconProps) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} />;
}
