import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Alert, AppState, Linking } from 'react-native';

import { downloadAndInstallApk } from '@/domain/apk-install';
import { checkGithubRelease, type GithubUpdate } from '@/domain/github-update';
import { UPDATE_DISMISSED_TAG_KEY } from '@/storage/keys';

let inFlight = false;
let installing = false;

async function installUpdate(update: GithubUpdate) {
  if (installing) return;
  installing = true;

  try {
    if (!update.apkUrl) {
      await Linking.openURL(update.url);
      return;
    }

    await downloadAndInstallApk(update.apkUrl, update.url);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível baixar a atualização.';
    Alert.alert('Atualização', message, [
      { text: 'OK', style: 'cancel' },
      {
        text: 'Abrir no GitHub',
        onPress: () => {
          void Linking.openURL(update.url);
        },
      },
    ]);
  } finally {
    installing = false;
  }
}

async function promptIfNewer() {
  if (inFlight || installing) return;
  inFlight = true;

  try {
    const update = await checkGithubRelease();
    if (!update) return;

    const dismissed = await AsyncStorage.getItem(UPDATE_DISMISSED_TAG_KEY);
    if (dismissed === update.tag) return;

    const label = update.name && update.name !== update.tag ? update.name : update.tag;

    Alert.alert(
      'Atualização disponível',
      `A versão ${label} já saiu. Você está na ${update.current}.\n\nO app baixa o APK e abre o instalador do Android. Seus dados continuam salvos.`,
      [
        {
          text: 'Agora não',
          style: 'cancel',
          onPress: () => {
            void AsyncStorage.setItem(UPDATE_DISMISSED_TAG_KEY, update.tag);
          },
        },
        {
          text: 'Atualizar',
          onPress: () => {
            void installUpdate(update);
          },
        },
      ]
    );
  } finally {
    inFlight = false;
  }
}

export function useGithubUpdateCheck() {
  useEffect(() => {
    const delay = setTimeout(() => {
      void promptIfNewer();
    }, 1600);

    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') void promptIfNewer();
    });

    return () => {
      clearTimeout(delay);
      sub.remove();
    };
  }, []);
}
