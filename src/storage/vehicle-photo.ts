import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

const PHOTO_DIR = `${FileSystem.documentDirectory}vehicles/`;

export async function persistVehiclePhoto(tempUri: string, vehicleId: string): Promise<string> {
  const info = await FileSystem.getInfoAsync(PHOTO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PHOTO_DIR, { intermediates: true });
  }
  const dest = `${PHOTO_DIR}${vehicleId}.jpg`;
  await FileSystem.copyAsync({ from: tempUri, to: dest });
  return dest;
}

export async function pickVehiclePhoto(): Promise<string | null> {
  return new Promise((resolve) => {
    Alert.alert('Foto do veículo', 'Como quer adicionar a foto?', [
      {
        text: 'Galeria',
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('Permissão', 'É preciso acesso às fotos para escolher uma imagem.');
            resolve(null);
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.85,
          });
          resolve(result.canceled ? null : result.assets[0]?.uri ?? null);
        },
      },
      {
        text: 'Câmera',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert('Permissão', 'É preciso acesso à câmera para fotografar o veículo.');
            resolve(null);
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.85,
          });
          resolve(result.canceled ? null : result.assets[0]?.uri ?? null);
        },
      },
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(null) },
    ]);
  });
}

export async function deleteVehiclePhoto(uri?: string): Promise<void> {
  if (!uri) return;
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // ignore missing files
  }
}
