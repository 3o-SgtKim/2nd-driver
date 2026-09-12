import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppIcon } from '@/components/app-icon';

type VehiclePhotoProps = {
  uri?: string;
  size?: number;
  radius?: number;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function VehiclePhoto({
  uri,
  size = 40,
  radius = 12,
  iconColor = '#60A5FA',
  style,
}: VehiclePhotoProps) {
  return (
    <View
      style={[
        styles.well,
        size > 0 ? { width: size, height: size } : styles.fill,
        { borderRadius: radius },
        style,
      ]}>
      {uri ? (
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      ) : (
        <AppIcon name="car-sport-outline" size={Math.round(size * 0.45)} color={iconColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  well: {
    overflow: 'hidden',
    backgroundColor: 'rgba(96, 165, 250, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
