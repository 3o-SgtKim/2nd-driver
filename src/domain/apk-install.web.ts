import { Linking } from 'react-native';

export async function downloadAndInstallApk(_apkUrl: string, fallbackUrl: string): Promise<void> {
  await Linking.openURL(fallbackUrl);
}
