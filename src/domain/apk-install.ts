import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import { Linking, Platform } from 'react-native';

const FLAG_GRANT_READ_URI_PERMISSION = 1;
const FLAG_ACTIVITY_NEW_TASK = 268435456;

export async function downloadAndInstallApk(apkUrl: string, fallbackUrl: string): Promise<void> {
  if (Platform.OS !== 'android') {
    await Linking.openURL(fallbackUrl);
    return;
  }

  const dest = `${FileSystem.cacheDirectory}2nd-driver-update.apk`;
  const download = await FileSystem.downloadAsync(apkUrl, dest, {
    headers: {
      Accept: 'application/octet-stream',
      'User-Agent': '2nd-driver-app',
    },
  });

  if (download.status !== 200) {
    throw new Error(`Download falhou (${download.status})`);
  }

  const contentUri = await FileSystem.getContentUriAsync(download.uri);

  try {
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
      data: contentUri,
      type: 'application/vnd.android.package-archive',
      flags: FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK,
    });
  } catch {
    await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.MANAGE_UNKNOWN_APP_SOURCES, {
      data: 'package:com.vekaemi.x2nddriver',
    });
    throw new Error('Permita instalar apps deste app e tente de novo.');
  }
}
